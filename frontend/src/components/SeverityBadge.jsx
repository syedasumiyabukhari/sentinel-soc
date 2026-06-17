const SEVERITY_STYLES = {
  critical: { color: "var(--color-critical)", label: "Critical" },
  high: { color: "var(--color-high)", label: "High" },
  medium: { color: "var(--color-medium)", label: "Medium" },
  low: { color: "var(--color-low)", label: "Low" },
};

export function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.low;
  return (
    <span
      className="font-data text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border"
      style={{
        color: style.color,
        borderColor: style.color,
        backgroundColor: `${style.color}1a`,
      }}
    >
      {style.label}
    </span>
  );
}

export function SeverityEdge({ severity }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.low;
  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-1"
      style={{ backgroundColor: style.color }}
      aria-hidden="true"
    />
  );
}

export function severityColor(severity) {
  return (SEVERITY_STYLES[severity] || SEVERITY_STYLES.low).color;
}
