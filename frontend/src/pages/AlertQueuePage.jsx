import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { AlertTable } from "../components/AlertTable";
import { AlertDetailPanel } from "../components/AlertDetailPanel";
import { useAuth } from "../context/AuthContext";
import * as alertsApi from "../api/alerts";

const SEVERITIES = ["critical", "high", "medium", "low"];
const STATUSES = ["new", "investigating", "escalated", "closed"];

export function AlertQueuePage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", severity: "" });
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canGenerate = user?.role === "admin" || user?.role === "analyst";

  const load = useCallback(async () => {
    setLoading(true);
    const data = await alertsApi.listAlerts({
      status: filters.status || undefined,
      severity: filters.severity || undefined,
      limit: 100,
    });
    setAlerts(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(id, newStatus) {
    setUpdating(true);
    try {
      const updated = await alertsApi.updateAlertStatus(id, newStatus);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSelected(updated);
    } finally {
      setUpdating(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await alertsApi.generateAlerts(10);
      await load();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              Alert Queue
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Triage incoming alerts and move them through the workflow.
            </p>
          </div>
          {canGenerate && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-md font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--color-cyan)", color: "#2a1018" }}
            >
              <Plus size={15} />
              {generating ? "Generating…" : "Generate alerts"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Select
            label="Status"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={STATUSES}
          />
          <Select
            label="Severity"
            value={filters.severity}
            onChange={(v) => setFilters((f) => ({ ...f, severity: v }))}
            options={SEVERITIES}
          />
          {(filters.status || filters.severity) && (
            <button
              onClick={() => setFilters({ status: "", severity: "" })}
              className="text-xs hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              Clear filters
            </button>
          )}
        </div>

        <AlertTable alerts={alerts} onSelect={setSelected} loading={loading} />
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

function Select({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs px-3 py-2 rounded-md border capitalize"
      style={{
        borderColor: "var(--color-border-bright)",
        backgroundColor: "var(--color-surface)",
        color: value ? "var(--color-text)" : "var(--color-text-faint)",
      }}
    >
      <option value="">{label}: All</option>
      {options.map((o) => (
        <option key={o} value={o} className="capitalize">
          {o}
        </option>
      ))}
    </select>
  );
}
