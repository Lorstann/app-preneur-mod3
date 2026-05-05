import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import require_permission
from app.core.scope_middleware import get_scoped_db
from app.models.document import Document
from app.models.user import User
from app.schemas.common import DocumentOut
from app.services.s3_service import build_s3_key, create_upload_url, validate_file_type

router = APIRouter()


class UploadUrlRequest(BaseModel):
    filename: str
    content_type: str
    org_id: uuid.UUID
    scope_id: uuid.UUID
    document_id: uuid.UUID
    version: int


@router.get("", response_model=list[DocumentOut])
async def list_documents(db: AsyncSession = Depends(get_scoped_db)) -> list[DocumentOut]:
    result = await db.execute(select(Document).order_by(Document.created_at.desc()))
    rows = result.scalars().all()
    return [
        DocumentOut(
            id=item.id,
            scope_id=item.scope_id,
            title=item.title,
            file_type=item.file_type,
            current_version=item.current_version,
            created_at=item.created_at,
        )
        for item in rows
    ]


@router.post("/upload-url")
async def create_document_upload_url(
    payload: UploadUrlRequest,
    _: User = Depends(require_permission("documents:upload")),
) -> dict[str, str]:
    try:
        ext = validate_file_type(payload.filename, payload.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    s3_key = build_s3_key(payload.org_id, payload.scope_id, payload.document_id, payload.version, ext)
    upload_url = create_upload_url(s3_key=s3_key, content_type=payload.content_type)
    return {"upload_url": upload_url, "s3_key": s3_key}
