import { useEffect, useState, useCallback } from "react";
import { ScrollText } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { SkeletonTableRows } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import * as auditApi from "../api/audit";

const ACTION_COLORS = {
  login: "var(--color-cyan)",
  user_created: "var(--color-cyan)",
  alerts_generated: "var(--color-text-muted)",
  alert_status_change: "var(--color-medium)",
  alert_assigned: "var(--color-low)",
  role_changed: "var(--color-high)",
  user_activated: "var(--color-low)",
  user_deactivated: "var(--color-critical)",
  "2fa_enabled": "var(--color-cyan)",
  "2fa_disabled": "var(--color-critical)",
};

export function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    auditApi
      .listAuditLogs({ limit: 200 })
      .then(setLogs)
      .catch((err) => {
        setError(
          err.response
            ? `The server responded with an error (${err.response.status}).`
            : "Couldn't reach the backend. Is it running?"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

        {error ? (
          <ErrorState message="Couldn't load the audit log." detail={error} onRetry={load} />
        ) : loading ? (
          <SkeletonTableRows rows={6} columns={3} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit events recorded yet"
            body="Actions like logins, alert status changes, and role updates will appear here as they happen."
          />
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
