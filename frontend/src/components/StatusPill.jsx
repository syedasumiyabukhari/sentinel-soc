const STATUS_STYLES = {
  new: { label: "New", color: "var(--color-cyan)" },
  investigating: { label: "Investigating", color: "var(--color-medium)" },
  escalated: { label: "Escalated", color: "var(--color-critical)" },
  closed: { label: "Closed", color: "var(--color-text-faint)" },
};

export function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: style.color, backgroundColor: `${style.color}14` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      {style.label}
    </span>
  );
}

export const STATUS_TRANSITIONS = {
  new: ["investigating", "closed"],
  investigating: ["escalated", "closed", "new"],
  escalated: ["investigating", "closed"],
  closed: ["new"],
};

export const STATUS_LABELS = {
  new: "New",
  investigating: "Investigating",
  escalated: "Escalated",
  closed: "Closed",
};
