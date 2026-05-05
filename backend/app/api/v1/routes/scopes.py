from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.scope_middleware import get_scoped_db
from app.models.scope import Scope

router = APIRouter()


@router.get("/tree")
async def visible_scope_tree(db: AsyncSession = Depends(get_scoped_db)) -> list[dict]:
    result = await db.execute(select(Scope))
    scopes = result.scalars().all()
    return [{"id": str(s.id), "name": s.name, "type": s.type, "parent_id": str(s.parent_id) if s.parent_id else None} for s in scopes]
