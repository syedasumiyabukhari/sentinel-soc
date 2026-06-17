"""
Synthetic SIEM alert generator.

Produces realistic-looking security events for the demo/training environment:
failed logins, port scans, brute force attempts, impossible travel, etc.
Each generated alert gets a real (or mock) IP reputation lookup and is scored
through the severity engine before being persisted.
"""
import json
import random
from datetime import datetime, timezone

from faker import Faker
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.services.reputation_service import check_ip_reputation
from app.services.severity_engine import compute_severity

fake = Faker()

ALERT_TEMPLATES = [
    {
        "type": "failed_login",
        "title": "Failed login attempt for user {user}",
        "description": "A failed authentication attempt was recorded for user '{user}' from {ip}.",
    },
    {
        "type": "brute_force",
        "title": "Brute force attack detected against {user}",
        "description": "{count} failed login attempts for user '{user}' from {ip} within 5 minutes.",
    },
    {
        "type": "port_scan",
        "title": "Port scan detected from {ip}",
        "description": "Sequential connection attempts observed against {count} ports on {dest_ip} from {ip}.",
    },
    {
        "type": "impossible_travel",
        "title": "Impossible travel alert for user {user}",
        "description": "User '{user}' authenticated from {country1} and then from {country2} within an implausible timeframe.",
    },
    {
        "type": "malware_signature",
        "title": "Malware signature match on {dest_ip}",
        "description": "Endpoint protection flagged a known malware signature ({sig}) communicating with {ip}.",
    },
    {
        "type": "data_exfil",
        "title": "Anomalous outbound data transfer from {dest_ip}",
        "description": "{size} MB transferred to external host {ip} outside of normal baseline for {dest_ip}.",
    },
    {
        "type": "privilege_escalation",
        "title": "Privilege escalation attempt on {dest_ip}",
        "description": "User '{user}' attempted to assume elevated privileges on {dest_ip} outside of approved change window.",
    },
    {
        "type": "suspicious_login",
        "title": "Login from new/unrecognized device for {user}",
        "description": "User '{user}' logged in from a device and location not previously seen, IP {ip}.",
    },
]

PRIVILEGED_USERNAMES = {"admin", "root", "administrator", "sysadmin", "dbadmin"}

MALWARE_SIGNATURES = ["Trojan.GenKD.45213", "Win32.Emotet.B", "Ransom.LockBit.Gen", "Backdoor.Cobalt.Strike"]


def _random_internal_ip() -> str:
    return f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"


def _random_username() -> str:
    if random.random() < 0.12:
        return random.choice(list(PRIVILEGED_USERNAMES))
    return fake.user_name()


async def generate_alert(db: Session) -> Alert:
    """
    Generates one synthetic alert, enriches it with IP reputation, scores it,
    persists it, and returns the new Alert row.
    """
    template = random.choice(ALERT_TEMPLATES)
    alert_type = template["type"]

    source_ip = fake.ipv4_public()
    dest_ip = _random_internal_ip()
    user = _random_username()
    is_privileged = user in PRIVILEGED_USERNAMES
    failed_count = random.randint(3, 35) if alert_type == "brute_force" else None
    port_count = random.randint(5, 200)
    country1, country2 = fake.country_code(), fake.country_code()
    sig = random.choice(MALWARE_SIGNATURES)
    size_mb = random.randint(50, 4000)

    fill = {
        "user": user,
        "ip": source_ip,
        "dest_ip": dest_ip,
        "count": failed_count or port_count,
        "country1": country1,
        "country2": country2,
        "sig": sig,
        "size": size_mb,
    }

    title = template["title"].format(**fill)
    description = template["description"].format(**fill)

    reputation = await check_ip_reputation(source_ip)

    score, severity = compute_severity(
        alert_type=alert_type,
        abuse_confidence_score=reputation["abuse_confidence_score"],
        is_tor=reputation["is_tor"],
        failed_attempt_count=failed_count,
        targeted_account_is_privileged=is_privileged,
        total_reports=reputation["total_reports"],
    )

    raw_event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "alert_type": alert_type,
        "source_ip": source_ip,
        "destination_ip": dest_ip,
        "username": user,
        "reputation": reputation,
        "simulated": True,
    }

    alert = Alert(
        alert_type=alert_type,
        severity=severity,
        severity_score=score,
        status="new",
        title=title,
        description=description,
        source_ip=source_ip,
        destination_ip=dest_ip,
        source_country=reputation.get("country_code"),
        username_targeted=user,
        port=random.choice([22, 80, 443, 3389, 445, 21, 8080]) if alert_type == "port_scan" else None,
        abuse_confidence_score=reputation["abuse_confidence_score"],
        is_tor=reputation["is_tor"],
        total_reports=reputation["total_reports"],
        raw_event=json.dumps(raw_event),
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


async def generate_batch(db: Session, count: int = 10) -> list[Alert]:
    return [await generate_alert(db) for _ in range(count)]
