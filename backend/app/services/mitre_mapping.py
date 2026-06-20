"""
MITRE ATT&CK mapping for Sentinel's alert types.

This is a deliberately small, curated mapping - not an attempt to cover the
full ATT&CK matrix. Each alert type maps to the technique that best matches
what the synthetic alert actually represents, so the mapping stays honest
rather than decorative.

Reference: https://attack.mitre.org/
"""

MITRE_MAPPING = {
    "failed_login": {
        "technique_id": "T1110",
        "technique_name": "Brute Force",
        "tactic_id": "TA0006",
        "tactic_name": "Credential Access",
        "url": "https://attack.mitre.org/techniques/T1110/",
    },
    "brute_force": {
        "technique_id": "T1110",
        "technique_name": "Brute Force",
        "tactic_id": "TA0006",
        "tactic_name": "Credential Access",
        "url": "https://attack.mitre.org/techniques/T1110/",
    },
    "port_scan": {
        "technique_id": "T1046",
        "technique_name": "Network Service Discovery",
        "tactic_id": "TA0007",
        "tactic_name": "Discovery",
        "url": "https://attack.mitre.org/techniques/T1046/",
    },
    "impossible_travel": {
        "technique_id": "T1078",
        "technique_name": "Valid Accounts",
        "tactic_id": "TA0001",
        "tactic_name": "Initial Access",
        "url": "https://attack.mitre.org/techniques/T1078/",
    },
    "suspicious_login": {
        "technique_id": "T1078",
        "technique_name": "Valid Accounts",
        "tactic_id": "TA0001",
        "tactic_name": "Initial Access",
        "url": "https://attack.mitre.org/techniques/T1078/",
    },
    "malware_signature": {
        "technique_id": "T1105",
        "technique_name": "Ingress Tool Transfer",
        "tactic_id": "TA0011",
        "tactic_name": "Command and Control",
        "url": "https://attack.mitre.org/techniques/T1105/",
    },
    "data_exfil": {
        "technique_id": "T1041",
        "technique_name": "Exfiltration Over C2 Channel",
        "tactic_id": "TA0010",
        "tactic_name": "Exfiltration",
        "url": "https://attack.mitre.org/techniques/T1041/",
    },
    "privilege_escalation": {
        "technique_id": "T1068",
        "technique_name": "Exploitation for Privilege Escalation",
        "tactic_id": "TA0004",
        "tactic_name": "Privilege Escalation",
        "url": "https://attack.mitre.org/techniques/T1068/",
    },
}


def get_mitre_mapping(alert_type: str):
    return MITRE_MAPPING.get(alert_type)
