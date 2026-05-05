from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.scope_middleware import get_scoped_db
from app.models.task import Task
from app.schemas.common import TaskOut

router = APIRouter()


@router.get("", response_model=list[TaskOut])
async def list_tasks(db: AsyncSession = Depends(get_scoped_db)) -> list[TaskOut]:
    result = await db.execute(select(Task).order_by(Task.created_at.desc()))
    rows = result.scalars().all()
    return [
        TaskOut(id=row.id, scope_id=row.scope_id, title=row.title, status=row.status, due_date=row.due_date)
        for row in rows
    ]
