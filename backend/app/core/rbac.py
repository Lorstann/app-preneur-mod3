from collections.abc import Callable

from fastapi import Depends, HTTPException

from app.core.security import get_current_user
from app.models.user import User

PERMISSION_ROLES: dict[str, set[str]] = {
    "users:create": {"Admin", "Director"},
    "users:update": {"Admin", "Director"},
    "documents:upload": {"Admin", "Director", "Lead", "Member"},
    "documents:delete": {"Admin", "Director", "Lead"},
    "tasks:assign": {"Admin", "Director", "Lead"},
    "admin:settings": {"Admin"},
}


def require_permission(permission: str) -> Callable:
    async def _permission_check(current_user: User = Depends(get_current_user)) -> User:
        allowed_roles = PERMISSION_ROLES.get(permission, set())
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permission.")
        return current_user

    return _permission_check
