"""
Rule-based severity scoring engine.

Takes raw alert attributes (type, IP reputation, frequency, targeted account, etc.)
and produces a 0-100 score plus a severity label. This is intentionally rule-based
(not ML) so the logic is transparent and explainable in triage - exactly what a
SOC analyst needs to justify a prioritization decision.
"""
from typing import Optional


# Base weight per alert type - reflects inherent risk of the event category
ALERT_TYPE_BASE_SCORE = {
    "failed_login": 15,
    "brute_force": 45,
    "port_scan": 25,
    "impossible_travel": 55,
    "malware_signature": 70,
    "data_exfil": 80,
    "privilege_escalation": 65,
    "suspicious_login": 35,
}


def compute_severity(
    alert_type: str,
    abuse_confidence_score: Optional[int] = None,
    is_tor: Optional[str] = None,
    failed_attempt_count: Optional[int] = None,
    targeted_account_is_privileged: bool = False,
    total_reports: Optional[int] = None,
) -> tuple[float, str]:
    """
    Returns (score 0-100, severity_label).
    """
    score = float(ALERT_TYPE_BASE_SCORE.get(alert_type, 20))

    # IP reputation contributes heavily - this is the AbuseIPDB integration point
    if abuse_confidence_score is not None:
        # AbuseIPDB confidence is already 0-100; weight it at 35% influence
        score += abuse_confidence_score * 0.35

    if is_tor == "true":
        score += 10

    if total_reports is not None and total_reports > 50:
        score += 8
    elif total_reports is not None and total_reports > 10:
        score += 4

    # Repeated failures within the correlation window escalate quickly
    if failed_attempt_count is not None:
        if failed_attempt_count >= 20:
            score += 20
        elif failed_attempt_count >= 10:
            score += 12
        elif failed_attempt_count >= 5:
            score += 6

    # An attack against an admin/privileged account is always worse
    if targeted_account_is_privileged:
        score += 15

    score = max(0.0, min(100.0, score))

    if score >= 75:
        label = "critical"
    elif score >= 50:
        label = "high"
    elif score >= 25:
        label = "medium"
    else:
        label = "low"

    return round(score, 1), label
