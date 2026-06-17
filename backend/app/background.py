"""
Background task that periodically generates synthetic alerts on a timer,
simulating a live SIEM feed without requiring manual triggering.
"""
import asyncio
import logging

from app.core.config import settings
from app.core.database import SessionLocal
from app.services.alert_generator import generate_alert

logger = logging.getLogger("sentinel.background")


async def alert_generation_loop():
    if not settings.ALERT_GENERATION_ENABLED:
        return

    while True:
        await asyncio.sleep(settings.ALERT_GENERATION_INTERVAL_SECONDS)
        db = SessionLocal()
        try:
            alert = await generate_alert(db)
            logger.info(f"Auto-generated alert #{alert.id}: {alert.alert_type} ({alert.severity})")
        except Exception:
            logger.exception("Failed to auto-generate alert")
        finally:
            db.close()
