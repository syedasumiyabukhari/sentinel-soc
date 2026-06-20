/**
 * Shown when a request succeeds but returns nothing to display.
 * Distinct from ErrorState - this isn't a failure, just nothing here yet.
 */
export function EmptyState({ icon: Icon, title = "Nothing here yet", body, action }) {
  return (
    <div
      className="rounded-md border py-12 px-6 text-center"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      {Icon && <Icon size={22} style={{ color: "var(--color-text-faint)" }} className="mx-auto mb-3" />}
      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{title}</p>
      {body && (
        <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: "var(--color-text-faint)" }}>{body}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
