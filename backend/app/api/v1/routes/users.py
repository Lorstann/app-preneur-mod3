from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import require_permission
from app.core.scope_middleware import get_scoped_db
from app.models.user import User
from app.services.permissions import can_manage_role

router = APIRouter()


class CreateUserRequest(BaseModel):
    clerk_id: str
    email: EmailStr
    role: str
    scope_id: str


@router.get("")
async def list_users(
    db: AsyncSession = Depends(get_scoped_db),
    _: User = Depends(require_permission("users:create")),
) -> list[dict]:
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [{"id": str(user.id), "email": user.email, "role": user.role, "scope_id": str(user.scope_id)} for user in users]


@router.post("")
async def create_user(
    payload: CreateUserRequest,
    db: AsyncSession = Depends(get_scoped_db),
    current_user: User = Depends(require_permission("users:create")),
) -> dict:
    if not can_manage_role(current_user.role, payload.role):
        raise HTTPException(status_code=403, detail="Cannot elevate or create user above your role.")

    user = User(clerk_id=payload.clerk_id, email=payload.email, role=payload.role, scope_id=payload.scope_id)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": str(user.id), "email": user.email, "role": user.role}
