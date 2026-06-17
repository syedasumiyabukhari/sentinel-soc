"""
IP reputation lookup service.

Wraps the AbuseIPDB API. If no API key is configured (USE_MOCK_REPUTATION=true,
which is the default), returns deterministic mock data instead - so the rest
of the application can be built and tested without depending on the external
service or burning API quota.
"""
import hashlib
import random
from typing import TypedDict, Optional

import httpx

from app.core.config import settings


class ReputationResult(TypedDict):
    ip_address: str
    abuse_confidence_score: int
    total_reports: int
    is_tor: str
    country_code: Optional[str]
    is_mock: bool


def _mock_reputation(ip_address: str) -> ReputationResult:
    """
    Deterministic mock reputation generator. Same IP always returns the same
    result within a run, seeded off the IP string, so the UI behaves consistently
    while testing instead of flickering between random values on refresh.
    """
    seed = int(hashlib.md5(ip_address.encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)

    # Skew distribution so most IPs look benign-ish and a minority look clearly malicious,
    # which mirrors what you'd actually see in a real alert feed.
    roll = rng.random()
    if roll < 0.55:
        confidence = rng.randint(0, 15)
        reports = rng.randint(0, 3)
    elif roll < 0.80:
        confidence = rng.randint(16, 50)
        reports = rng.randint(2, 15)
    else:
        confidence = rng.randint(51, 100)
        reports = rng.randint(10, 200)

    is_tor = "true" if rng.random() < 0.07 else "false"
    country = rng.choice(["US", "CN", "RU", "DE", "BR", "IN", "NL", "VN", "FR", "GB", None])

    return {
        "ip_address": ip_address,
        "abuse_confidence_score": confidence,
        "total_reports": reports,
        "is_tor": is_tor,
        "country_code": country,
        "is_mock": True,
    }


async def check_ip_reputation(ip_address: str) -> ReputationResult:
    """
    Look up IP reputation. Uses AbuseIPDB if configured, otherwise mock data.
    Falls back to mock on any API error so alert ingestion never breaks because
    of a third-party outage or rate limit.
    """
    if settings.USE_MOCK_REPUTATION or not settings.ABUSEIPDB_API_KEY:
        return _mock_reputation(ip_address)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.ABUSEIPDB_BASE_URL}/check",
                params={"ipAddress": ip_address, "maxAgeInDays": 90},
                headers={
                    "Key": settings.ABUSEIPDB_API_KEY,
                    "Accept": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json().get("data", {})

            return {
                "ip_address": ip_address,
                "abuse_confidence_score": data.get("abuseConfidenceScore", 0),
                "total_reports": data.get("totalReports", 0),
                "is_tor": "true" if data.get("isTor") else "false",
                "country_code": data.get("countryCode"),
                "is_mock": False,
            }
    except (httpx.HTTPError, httpx.TimeoutException, KeyError, ValueError):
        # Real API failed - degrade gracefully rather than dropping the alert
        fallback = _mock_reputation(ip_address)
        fallback["is_mock"] = True
        return fallback
