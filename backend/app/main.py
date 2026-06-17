"""
Sentinel - SOC Alert Triage & Incident Response Dashboard
FastAPI application entrypoint.
"""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.background import alert_generation_loop
from app.routers import auth, alerts, audit

logging.basicConfig(level=logging.INFO)

# Create tables (fine for sqlite/dev; use Alembic migrations for production)
Base.metadata.create_all(bind=engine)

_background_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _background_task
    _background_task = asyncio.create_task(alert_generation_loop())
    yield
    if _background_task:
        _background_task.cancel()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(audit.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
