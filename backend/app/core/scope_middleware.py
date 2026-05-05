from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User


async def set_scope_context(db: AsyncSession, user: User) -> None:
    await db.execute(
        text("SELECT set_config('app.current_user_scope_id', :scope_id, true)"),
        {"scope_id": str(user.scope_id)},
    )


async def get_scoped_db(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AsyncGenerator[AsyncSession, None]:
    await set_scope_context(db, current_user)
    yield db
