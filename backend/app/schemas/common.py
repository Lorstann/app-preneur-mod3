from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class ScopeRef(BaseModel):
    id: UUID
    type: str
    name: str


class UserContext(BaseModel):
    id: UUID
    clerk_id: str
    role: str
    scope: ScopeRef
    authorized_scopes: list[UUID]


class DocumentOut(BaseModel):
    id: UUID
    scope_id: UUID
    title: str
    file_type: str
    current_version: int
    created_at: datetime


class TaskOut(BaseModel):
    id: UUID
    scope_id: UUID
    title: str
    status: str
    due_date: date | None
