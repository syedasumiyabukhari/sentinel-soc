import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";
import { Sidebar } from "../components/Sidebar";
import { StatTile } from "../components/StatTile";
import { AlertTable } from "../components/AlertTable";
import { AlertDetailPanel } from "../components/AlertDetailPanel";
import * as alertsApi from "../api/alerts";

export function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const [statsData, alertsData] = await Promise.all([
      alertsApi.getStats(),
      alertsApi.listAlerts({ limit: 8 }),
    ]);
    setStats(statsData);
    setRecent(alertsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleStatusChange(id, newStatus) {
    setUpdating(true);
    try {
      const updated = await alertsApi.updateAlertStatus(id, newStatus);
      setRecent((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSelected(updated);
      await load();
    } finally {
      setUpdating(false);
    }
  }

  const severityData = stats
    ? [
        { name: "Critical", value: stats.by_severity.critical, color: "#d6453f" },
        { name: "High", value: stats.by_severity.high, color: "#e8732e" },
        { name: "Medium", value: stats.by_severity.medium, color: "#d9a838" },
        { name: "Low", value: stats.by_severity.low, color: "#e8965c" },
      ]
    : [];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              Overview
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Live snapshot of the alert pipeline.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-text-faint)" }}>Loading…</p>
        ) : (
          <>
            <div className="flex gap-3 mb-6">
              <StatTile label="Alerts today" value={stats.alerts_today} />
              <StatTile label="Open" value={stats.open_count} accent="var(--color-cyan)" />
              <StatTile label="Closed" value={stats.closed_count} />
              <StatTile
                label="Critical open"
                value={stats.by_severity.critical}
                accent="var(--color-critical)"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div
                className="col-span-2 rounded-md border p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "var(--color-text-faint)" }}>
                  Open alerts by severity
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={severityData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-text-faint)" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="var(--color-text-faint)" fontSize={11} width={70} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                      {severityData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div
                className="rounded-md border p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "var(--color-text-faint)" }}>
                  Top flagged IPs
                </p>
                <div className="space-y-2">
                  {stats.top_flagged_ips.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--color-text-faint)" }}>No data yet.</p>
                  )}
                  {stats.top_flagged_ips.map((row) => (
                    <div key={row.ip} className="flex items-center justify-between">
                      <span className="font-data text-xs" style={{ color: "var(--color-text)" }}>{row.ip}</span>
                      <span className="font-data text-xs" style={{ color: "var(--color-cyan)" }}>{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--color-text-faint)" }}>
              Recent alerts
            </p>
            <AlertTable alerts={recent} onSelect={setSelected} loading={false} />
          </>
        )}
      </main>

      {selected && (
        <AlertDetailPanel
          alert={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}
    </div>
  );
}
