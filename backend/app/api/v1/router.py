from fastapi import APIRouter

from app.api.v1.routes import agent, analytics, auth, documents, scopes, tasks, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(scopes.router, prefix="/scopes", tags=["scopes"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
