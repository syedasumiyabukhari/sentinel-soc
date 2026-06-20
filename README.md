# Sentinel — SOC Alert Triage & Incident Response Dashboard

Sentinel is a security operations dashboard for triaging alerts the way a real SOC analyst would: alerts come in, get scored for severity, get enriched with IP reputation data and MITRE ATT&CK mapping, and move through a triage workflow from first detection to resolution — with every action recorded in an audit trail.

All alert data is synthetically generated for demonstration purposes — there's no live data feed. The point of the project is the workflow and the engineering around it: scoring, RBAC, audit logging, and triage state management, the same systems a real SOC tool needs regardless of where the alerts come from.

Built as a companion portfolio project to [VulnScanner Pro](https://github.com/syedasumiyabukhari/vulnscanner-pro), reusing the same authentication pattern and stack.

## What it does

- **Synthetic SIEM-style alert generation** — failed logins, port scans, brute force attempts, impossible-travel logins, malware signatures, and more, generated continuously by a background task and on demand.
- **Rule-based severity scoring** — each alert is scored and bucketed into critical / high / medium / low.
- **IP reputation enrichment** — integrates with [AbuseIPDB](https://www.abuseipdb.com/) for abuse confidence scores, total reports, TOR exit node detection, ASN, and ISP, with realistic mock data as a fallback so the app works fully offline without an API key.
- **MITRE ATT&CK mapping** — each alert type maps to a real tactic/technique pair from the [MITRE ATT&CK](https://attack.mitre.org/) framework, with a direct link to the official entry.
- **Triage workflow** — alerts move New → Investigating → Escalated → Closed, with transition rules enforced server-side, plus a full per-alert status history and a comment thread for analyst notes.
- **Audit log** — every login, alert generation, status change, role change, and account action is recorded with actor, timestamp, and detail.
- **JWT authentication with TOTP 2FA** — optional app-based two-factor authentication (Google Authenticator, Authy, etc.), enforced as a required second step once enabled on an account.
- **Account lockout** — five consecutive failed login attempts locks the account for 15 minutes, mitigating brute-force password guessing.
- **Role-based access control** — viewer / analyst / admin roles enforced on every endpoint server-side, not just hidden in the UI. The first account created becomes admin automatically; every account after that starts as the lowest-privilege role, and only an existing admin can promote anyone — there is no client-controllable "become admin" path.
- **Admin user management** — promote/demote roles and activate/deactivate accounts from a dedicated admin-only screen.

## Stack

**Backend:** FastAPI, SQLAlchemy, SQLite, JWT auth (python-jose), bcrypt password hashing, pyotp/qrcode for TOTP 2FA.
**Frontend:** React (Vite), Tailwind CSS v4, React Router, Recharts, Axios, Lucide icons.

## Design

Dark graphite theme with orange as the single accent color. Severity is color-coded throughout (critical = red, high = orange, medium = amber, low = light orange) and shown as a left-edge bar on each alert row rather than badge clutter. Data fields (IPs, timestamps, scores) use a monospace face to read like real telemetry. The landing page features an animated orbit visual representing the system's core capabilities, and a live-ticking alert feed preview.

## Running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\Activate
pip install -r requirements.txt
cp .env.example .env
# optionally add a real AbuseIPDB key to .env, or leave USE_MOCK_REPUTATION=true
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`. Health check at `/api/health`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`. Register an account on the landing page to get started — the **first account created becomes admin automatically**; every account after that starts as a read-only viewer and needs to be promoted by an admin via the Manage Users screen.

## Getting an AbuseIPDB key (optional)

The app works fully without one — mock reputation data is realistic and indistinguishable in the UI. To use real lookups:

1. Create a free account at [abuseipdb.com](https://www.abuseipdb.com/)
2. Go to Account → API and create a key (free tier: 1,000 checks/day)
3. Add it to `backend/.env` as `ABUSEIPDB_API_KEY` and set `USE_MOCK_REPUTATION=false`

## Setting up two-factor authentication

From Security Settings, click "Enable 2FA," scan the QR code with any TOTP authenticator app, and confirm with the 6-digit code it generates. Once enabled, that account requires the code on every future login.

## API overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Create an account (role is assigned server-side, not client-controlled) |
| `POST /api/auth/login` | Log in, returns a JWT or a 2FA-pending token |
| `POST /api/auth/login/verify-2fa` | Complete login with a TOTP code |
| `POST /api/auth/2fa/setup` / `/enable` / `/disable` | Manage two-factor authentication |
| `GET /api/alerts` | List alerts, filterable by status/severity/type/IP |
| `GET /api/alerts/{id}` | Full alert detail, including enrichment and MITRE mapping |
| `GET /api/alerts/stats` | Dashboard aggregate stats |
| `POST /api/alerts/generate` | Generate synthetic alerts (analyst/admin) |
| `PATCH /api/alerts/{id}/status` | Move an alert through the triage workflow |
| `GET/POST /api/alerts/{id}/comments` | Read or add analyst notes on an alert |
| `GET /api/audit-logs` | Read-only audit trail |
| `GET /api/users` | List all accounts (admin only) |
| `PATCH /api/users/{id}/role` / `/active` | Promote/demote or activate/deactivate an account (admin only) |

## A note on the data

Every alert, IP address, and username in this project is synthetically generated for demonstration. It is not connected to any real organization's logs or infrastructure, and is not intended to be.