from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.permissions import get_authorized_scope_ids
from app.services.rag_service import permission_aware_retrieve

router = APIRouter()


class AgentQueryRequest(BaseModel):
    question: str


@router.post("/query")
async def query_agent(
    payload: AgentQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    authorized_scopes: list[UUID] = await get_authorized_scope_ids(db, current_user.scope_id)
    return await permission_aware_retrieve(payload.question, authorized_scopes)
