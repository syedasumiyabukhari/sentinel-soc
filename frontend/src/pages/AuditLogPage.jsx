import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import * as auditApi from "../api/audit";

const ACTION_COLORS = {
  login: "var(--color-cyan)",
  user_created: "var(--color-cyan)",
  alerts_generated: "var(--color-text-muted)",
  alert_status_change: "var(--color-medium)",
  alert_assigned: "var(--color-low)",
};

export function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditApi.listAuditLogs({ limit: 200 }).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>
          Audit Log
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          Read-only record of authentication and triage actions.
        </p>

        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-text-faint)" }}>Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-faint)" }}>No audit events recorded yet.</p>
        ) : (
          <div
            className="rounded-md border divide-y"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: ACTION_COLORS[log.action] || "var(--color-text-faint)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--color-text)" }}>
                    <span className="font-medium">{log.actor_username || "system"}</span>{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>{log.detail || log.action}</span>
                  </p>
                </div>
                <span className="font-data text-xs shrink-0" style={{ color: "var(--color-text-faint)" }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
