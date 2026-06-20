/**
 * A pulsing placeholder block used while real content loads. Pass a height
 * to roughly match what's being replaced (a stat tile, a table row, etc.)
 * so the layout doesn't visibly jump once real data arrives.
 */
export function Skeleton({ height = 16, width = "100%", rounded = "md", className = "" }) {
  const radius = { sm: 4, md: 6, lg: 10, full: 999 }[rounded] ?? 6;
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: "var(--color-border)",
      }}
    />
  );
}

export function SkeletonStatTile() {
  return (
    <div
      className="flex-1 px-4 py-3 rounded-md border"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <Skeleton height={11} width={70} className="mb-2" />
      <Skeleton height={26} width={50} />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, columns = 5 }) {
  return (
    <div
      className="rounded-md border overflow-hidden"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height={13} width={c === 0 ? "15%" : `${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}
