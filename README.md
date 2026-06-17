# Sentinel — SOC Alert Triage & Incident Response Dashboard

Sentinel is a security operations dashboard for triaging alerts the way a real SOC analyst would: alerts come in, get scored for severity, get enriched with IP reputation data, and move through a triage workflow from first detection to resolution — with every action recorded in an audit trail.

Built as a companion portfolio project to [VulnScanner Pro](https://github.com/syedasumiyabukhari/vulnscanner-pro), reusing the same authentication pattern and stack.

## What it does

- **Synthetic SIEM-style alert generation** — failed logins, port scans, brute force attempts, and impossible-travel logins, generated continuously by a background task and on demand.
- **Rule-based severity scoring** — each alert is scored and bucketed into critical / high / medium / low.
- **IP reputation lookups** — integrates with [AbuseIPDB](https://www.abuseipdb.com/) for real abuse confidence scores and TOR exit node detection, with realistic mock data as a fallback so the app works fully offline without an API key.
- **Triage workflow** — alerts move New → Investigating → Escalated → Closed, with transition rules enforced server-side.
- **Audit log** — every login, alert generation, status change, and assignment is recorded with actor, timestamp, and detail.
- **JWT auth with role-based access** — viewer / analyst / admin roles, enforced per-endpoint.

## Stack

**Backend:** FastAPI, SQLAlchemy, SQLite, JWT auth (python-jose), bcrypt password hashing.
**Frontend:** React (Vite), Tailwind CSS v4, React Router, Recharts, Axios, Lucide icons.

## Design

Dark cyberpunk theme with electric cyan as the primary accent. Severity is color-coded throughout (critical = red, high = orange, medium = amber, low = cyan) and shown as a left-edge bar on each alert row rather than badge clutter. Data fields (IPs, timestamps, scores) use a monospace face to read like real telemetry; UI labels use a clean grotesque. A live pulse-line animation in the sidebar reflects the background alert generation running underneath.

## Running locally

### Backend

```bash
cd backend
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

Frontend runs on `http://localhost:5173`. Register an account (any role) on first load to get started — choosing `admin` or `analyst` lets you generate alerts and run triage; `viewer` is read-only.

## Getting an AbuseIPDB key (optional)

The app works fully without one — mock reputation data is realistic and indistinguishable in the UI. To use real lookups:

1. Create a free account at [abuseipdb.com](https://www.abuseipdb.com/)
2. Go to Account → API and create a key (free tier: 1,000 checks/day)
3. Add it to `backend/.env` as `ABUSEIPDB_API_KEY` and set `USE_MOCK_REPUTATION=false`

## API overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Create an account |
| `POST /api/auth/login` | Log in, returns JWT |
| `GET /api/alerts` | List alerts, filterable by status/severity/type/IP |
| `GET /api/alerts/stats` | Dashboard aggregate stats |
| `POST /api/alerts/generate` | Generate synthetic alerts (analyst/admin) |
| `PATCH /api/alerts/{id}/status` | Move an alert through the triage workflow |
| `PATCH /api/alerts/{id}/assign` | Assign an alert to a user |
| `GET /api/audit-logs` | Read-only audit trail (analyst/admin) |
