import hashlib
import hmac
import json
import logging
import time
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.settings import settings
from app.core.security import get_current_user
from app.models.scope import Scope
from app.models.user import User
from app.schemas.common import ScopeRef, UserContext
from app.services.permissions import get_authorized_scope_ids

router = APIRouter()
audit_logger = logging.getLogger("security.audit")


class ClerkSyncRequest(BaseModel):
    clerk_id: str
    email: EmailStr
    role: str | None = None
    scope_id: UUID | None = None


class ClerkSyncResponse(BaseModel):
    user_id: UUID
    role: str
    scope_id: UUID
    scope_type: str
    scope_name: str
    authorized_scopes: list[UUID]


def _audit_sync_event(
    outcome: str,
    reason: str,
    *,
    clerk_id: str | None = None,
    nonce: str | None = None,
    request_timestamp: str | None = None,
    request_id: str | None = None,
) -> None:
    payload = {
        "event": "internal_clerk_sync",
        "outcome": outcome,
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "clerk_id": clerk_id,
        "nonce": nonce,
        "request_timestamp": request_timestamp,
        "request_id": request_id,
    }
    message = json.dumps(payload, default=str)
    if outcome == "accepted":
        audit_logger.info(message)
    else:
        audit_logger.warning(message)


async def _select_default_scope(db: AsyncSession) -> Scope:
    result = await db.execute(select(Scope).order_by(Scope.created_at.asc()))
    scope = result.scalars().first()
    if scope is None:
        raise HTTPException(status_code=500, detail="No scopes found for user provisioning.")
    return scope


def _require_internal_api_key(
    x_internal_api_key: str | None,
    *,
    clerk_id: str | None = None,
    request_id: str | None = None,
) -> None:
    if not settings.internal_api_key:
        _audit_sync_event(
            "rejected",
            "internal_api_key_not_configured",
            clerk_id=clerk_id,
            request_id=request_id,
        )
        raise HTTPException(
            status_code=500,
            detail="INTERNAL_API_KEY is not configured on backend.",
        )
    if x_internal_api_key != settings.internal_api_key:
        _audit_sync_event(
            "rejected",
            "invalid_internal_api_key",
            clerk_id=clerk_id,
            request_id=request_id,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid internal API key.")


async def _assert_replay_protection(
    db: AsyncSession,
    *,
    body: bytes,
    x_internal_timestamp: str | None,
    x_internal_nonce: str | None,
    x_internal_signature: str | None,
    clerk_id: str | None = None,
    request_id: str | None = None,
) -> None:
    if not settings.internal_sync_signing_secret:
        _audit_sync_event(
            "rejected",
            "internal_signing_secret_not_configured",
            clerk_id=clerk_id,
            request_id=request_id,
        )
        raise HTTPException(status_code=500, detail="INTERNAL_SYNC_SIGNING_SECRET is not configured on backend.")
    if not x_internal_timestamp or not x_internal_nonce or not x_internal_signature:
        _audit_sync_event(
            "rejected",
            "missing_signed_headers",
            clerk_id=clerk_id,
            nonce=x_internal_nonce,
            request_timestamp=x_internal_timestamp,
            request_id=request_id,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing signed request headers.")

    try:
        request_timestamp = int(x_internal_timestamp)
    except ValueError as exc:
        _audit_sync_event(
            "rejected",
            "invalid_timestamp_header",
            clerk_id=clerk_id,
            nonce=x_internal_nonce,
            request_timestamp=x_internal_timestamp,
            request_id=request_id,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid timestamp header.") from exc

    now = int(time.time())
    if abs(now - request_timestamp) > settings.internal_sync_max_skew_seconds:
        _audit_sync_event(
            "rejected",
            "expired_timestamp_skew",
            clerk_id=clerk_id,
            nonce=x_internal_nonce,
            request_timestamp=x_internal_timestamp,
            request_id=request_id,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expired signed request timestamp.")

    expected_signature = hmac.new(
        settings.internal_sync_signing_secret.encode("utf-8"),
        f"{x_internal_timestamp}.{x_internal_nonce}.{body.decode('utf-8')}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected_signature, x_internal_signature):
        _audit_sync_event(
            "rejected",
            "invalid_signature",
            clerk_id=clerk_id,
            nonce=x_internal_nonce,
            request_timestamp=x_internal_timestamp,
            request_id=request_id,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signed request signature.")

    await db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS internal_request_nonces (
              nonce TEXT PRIMARY KEY,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
    )
    await db.execute(
        text("DELETE FROM internal_request_nonces WHERE created_at < now() - interval '15 minutes'")
    )
    insert_result = await db.execute(
        text("INSERT INTO internal_request_nonces (nonce) VALUES (:nonce) ON CONFLICT DO NOTHING"),
        {"nonce": x_internal_nonce},
    )
    if insert_result.rowcount == 0:
        _audit_sync_event(
            "rejected",
            "replay_nonce_detected",
            clerk_id=clerk_id,
            nonce=x_internal_nonce,
            request_timestamp=x_internal_timestamp,
            request_id=request_id,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Replay detected for nonce.")


@router.post("/sync", response_model=UserContext)
async def sync_user_context(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserContext:
    scope_result = await db.execute(select(Scope).where(Scope.id == current_user.scope_id))
    scope = scope_result.scalar_one()
    authorized_scopes = await get_authorized_scope_ids(db, current_user.scope_id)
    return UserContext(
        id=current_user.id,
        clerk_id=current_user.clerk_id,
        role=current_user.role,
        scope=ScopeRef(id=scope.id, type=scope.type, name=scope.name),
        authorized_scopes=authorized_scopes,
    )


@router.post("/clerk-sync", response_model=ClerkSyncResponse)
async def clerk_sync_user(
    request: Request,
    payload: ClerkSyncRequest,
    db: AsyncSession = Depends(get_db),
    x_internal_api_key: str | None = Header(default=None),
    x_internal_timestamp: str | None = Header(default=None),
    x_internal_nonce: str | None = Header(default=None),
    x_internal_signature: str | None = Header(default=None),
) -> ClerkSyncResponse:
    request_id = request.headers.get("x-request-id")
    _require_internal_api_key(
        x_internal_api_key,
        clerk_id=payload.clerk_id,
        request_id=request_id,
    )
    await _assert_replay_protection(
        db,
        body=await request.body(),
        x_internal_timestamp=x_internal_timestamp,
        x_internal_nonce=x_internal_nonce,
        x_internal_signature=x_internal_signature,
        clerk_id=payload.clerk_id,
        request_id=request_id,
    )

    existing_user_result = await db.execute(select(User).where(User.clerk_id == payload.clerk_id))
    existing_user = existing_user_result.scalar_one_or_none()

    scope: Scope
    if payload.scope_id is not None:
        scope_result = await db.execute(select(Scope).where(Scope.id == payload.scope_id))
        scope = scope_result.scalar_one_or_none()
        if scope is None:
            raise HTTPException(status_code=400, detail="Invalid scope_id for provisioning.")
    elif existing_user is not None:
        scope_result = await db.execute(select(Scope).where(Scope.id == existing_user.scope_id))
        scope = scope_result.scalar_one()
    else:
        scope = await _select_default_scope(db)

    if payload.role:
        role = payload.role
    elif existing_user is not None:
        role = existing_user.role
    else:
        role = "Member"
    role = role if role in {"Admin", "Director", "Lead", "Member"} else "Member"

    if existing_user is None:
        user = User(clerk_id=payload.clerk_id, email=str(payload.email), role=role, scope_id=scope.id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        existing_user.email = str(payload.email)
        existing_user.role = role
        existing_user.scope_id = scope.id
        await db.commit()
        await db.refresh(existing_user)
        user = existing_user

    authorized_scopes = await get_authorized_scope_ids(db, scope.id)
    _audit_sync_event(
        "accepted",
        "sync_success",
        clerk_id=payload.clerk_id,
        nonce=x_internal_nonce,
        request_timestamp=x_internal_timestamp,
        request_id=request_id,
    )
    return ClerkSyncResponse(
        user_id=user.id,
        role=user.role,
        scope_id=scope.id,
        scope_type=scope.type,
        scope_name=scope.name,
        authorized_scopes=authorized_scopes,
    )
