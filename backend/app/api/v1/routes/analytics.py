from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.scope_middleware import get_scoped_db
from app.models.document import Document
from app.models.task import Task

router = APIRouter()


@router.get("/summary")
async def analytics_summary(db: AsyncSession = Depends(get_scoped_db)) -> dict[str, int]:
    document_count = (await db.execute(select(func.count(Document.id)))).scalar_one()
    task_count = (await db.execute(select(func.count(Task.id)))).scalar_one()
    done_count = (await db.execute(select(func.count(Task.id)).where(Task.status == "done"))).scalar_one()
    return {
        "documents": document_count,
        "tasks": task_count,
        "tasks_completed": done_count,
    }
