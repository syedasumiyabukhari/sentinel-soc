import { SeverityBadge, SeverityEdge } from "./SeverityBadge";
import { StatusPill } from "./StatusPill";
import { SkeletonTableRows } from "./Skeleton";
import { ShieldOff } from "lucide-react";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function AlertTable({ alerts, onSelect, loading }) {
  if (loading) {
    return <SkeletonTableRows rows={6} columns={5} />;
  }

  if (!alerts.length) {
    return (
      <div
        className="py-16 text-center rounded-md border"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <ShieldOff size={20} style={{ color: "var(--color-text-faint)" }} className="mx-auto mb-2" />
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          No alerts match these filters.
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-faint)" }}>
          Adjust filters, or generate new synthetic alerts to populate the queue.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-md border overflow-hidden"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b" style={{ borderColor: "var(--color-border)" }}>
            {["Severity", "Alert", "Source IP", "Status", "Detected"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-xs uppercase tracking-wide font-medium"
                style={{ color: "var(--color-text-faint)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr
              key={alert.id}
              onClick={() => onSelect(alert)}
              className="relative border-b cursor-pointer transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <td className="relative px-4 py-3">
                <SeverityEdge severity={alert.severity} />
                <SeverityBadge severity={alert.severity} />
              </td>
              <td className="px-4 py-3">
                <p style={{ color: "var(--color-text)" }}>{alert.title}</p>
                <p className="font-data text-xs mt-0.5" style={{ color: "var(--color-text-faint)" }}>
                  {alert.alert_type.replace(/_/g, " ")}
                </p>
              </td>
              <td className="px-4 py-3 font-data text-xs" style={{ color: "var(--color-text-muted)" }}>
                <div className="flex items-center gap-2">
                  <span>{alert.source_ip || "—"}</span>
                  {alert.abuse_confidence_score !== null && alert.abuse_confidence_score !== undefined && alert.abuse_confidence_score >= 50 && (
                    <span
                      title={`AbuseIPDB confidence: ${alert.abuse_confidence_score}%`}
                      className="px-1.5 py-0.5 rounded-sm text-[10px] font-semibold"
                      style={{ backgroundColor: "rgba(214,69,63,0.12)", color: "var(--color-critical)" }}
                    >
                      {alert.abuse_confidence_score}%
                    </span>
                  )}
                  {alert.is_tor === "true" && (
                    <span
                      title="TOR exit node"
                      className="px-1.5 py-0.5 rounded-sm text-[10px] font-semibold"
                      style={{ backgroundColor: "rgba(217,168,56,0.12)", color: "var(--color-medium)" }}
                    >
                      TOR
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusPill status={alert.status} />
              </td>
              <td className="px-4 py-3 font-data text-xs" style={{ color: "var(--color-text-faint)" }}>
                {timeAgo(alert.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
