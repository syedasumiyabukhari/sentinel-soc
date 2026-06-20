import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Shown when a data fetch fails. Always offers a retry action - a dead end
 * with no way forward is worse than no error message at all.
 */
export function ErrorState({ message = "Something went wrong.", detail, onRetry }) {
  return (
    <div
      className="rounded-md border p-6 text-center"
      style={{ borderColor: "var(--color-critical)", backgroundColor: "rgba(214,69,63,0.06)" }}
    >
      <AlertTriangle size={20} style={{ color: "var(--color-critical)" }} className="mx-auto mb-2" />
      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{message}</p>
      {detail && (
        <p className="font-data text-xs mt-1" style={{ color: "var(--color-text-faint)" }}>{detail}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs mt-3 px-3 py-1.5 rounded-md border"
          style={{ borderColor: "var(--color-border-bright)", color: "var(--color-text)" }}
        >
          <RotateCw size={12} />
          Try again
        </button>
      )}
    </div>
  );
}
