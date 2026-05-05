from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def get_authorized_scope_ids(db: AsyncSession, scope_id: UUID) -> list[UUID]:
    query = text("SELECT id FROM get_all_child_scopes(:scope_id)")
    result = await db.execute(query, {"scope_id": str(scope_id)})
    return [row[0] for row in result.fetchall()]


ROLE_RANK = {"Member": 1, "Lead": 2, "Director": 3, "Admin": 4}


def can_manage_role(requester_role: str, target_role: str) -> bool:
    return ROLE_RANK.get(requester_role, 0) >= ROLE_RANK.get(target_role, 0)
