from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.logging_config import configure_security_audit_logger

app = FastAPI(title="Corporate Nexus API", version="0.1.0")
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_logging() -> None:
    configure_security_audit_logger()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
