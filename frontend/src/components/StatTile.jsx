export function StatTile({ label, value, accent, sub }) {
  return (
    <div
      className="flex-1 px-4 py-3 rounded-md border"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
        {label}
      </p>
      <p
        className="font-data text-2xl font-semibold mt-1"
        style={{ color: accent || "var(--color-text)" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
