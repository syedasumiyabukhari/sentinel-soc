import { X, Globe, Server, User as UserIcon, ShieldQuestion } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { StatusPill, STATUS_TRANSITIONS, STATUS_LABELS } from "./StatusPill";

function Field({ icon: Icon, label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b" style={{ borderColor: "var(--color-border)" }}>
      <Icon size={15} className="mt-0.5" style={{ color: "var(--color-text-faint)" }} />
      <div className="flex-1">
        <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>{label}</p>
        <p className="font-data text-sm mt-0.5" style={{ color: "var(--color-text)" }}>{value}</p>
      </div>
    </div>
  );
}

export function AlertDetailPanel({ alert, onClose, onStatusChange, updating }) {
  if (!alert) return null;
  const transitions = STATUS_TRANSITIONS[alert.status] || [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-md h-full overflow-y-auto border-l shadow-2xl"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-start justify-between px-5 py-4 border-b sticky top-0"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={alert.severity} />
              <StatusPill status={alert.status} />
            </div>
            <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
              {alert.title}
            </h2>
            <p className="font-data text-xs mt-1" style={{ color: "var(--color-text-faint)" }}>
              ALERT #{alert.id} · {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {alert.description && (
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              {alert.description}
            </p>
          )}

          <div className="mb-4">
            <Field icon={Globe} label="Source IP" value={alert.source_ip} />
            <Field icon={Server} label="Destination IP" value={alert.destination_ip} />
            <Field icon={Globe} label="Source country" value={alert.source_country} />
            <Field icon={UserIcon} label="Targeted username" value={alert.username_targeted} />
            <Field icon={ShieldQuestion} label="Port" value={alert.port} />
          </div>

          {(alert.abuse_confidence_score !== null && alert.abuse_confidence_score !== undefined) && (
            <div
              className="rounded-md p-3 mb-4 border"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
            >
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--color-text-faint)" }}>
                IP Reputation (AbuseIPDB)
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Abuse confidence</span>
                <span className="font-data text-sm font-semibold" style={{ color: "var(--color-cyan)" }}>
                  {alert.abuse_confidence_score}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Total reports</span>
                <span className="font-data text-sm" style={{ color: "var(--color-text)" }}>
                  {alert.total_reports ?? 0}
                </span>
              </div>
              {alert.is_tor === "true" && (
                <p className="font-data text-xs mt-2" style={{ color: "var(--color-critical)" }}>
                  TOR EXIT NODE DETECTED
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--color-text-faint)" }}>
              Update status
            </p>
            <div className="flex flex-wrap gap-2">
              {transitions.map((next) => (
                <button
                  key={next}
                  disabled={updating}
                  onClick={() => onStatusChange(alert.id, next)}
                  className="text-xs px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50"
                  style={{
                    borderColor: "var(--color-border-bright)",
                    color: "var(--color-text)",
                  }}
                >
                  Move to {STATUS_LABELS[next]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
