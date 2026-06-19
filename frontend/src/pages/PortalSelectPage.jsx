import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, User, ArrowLeft, Radio } from "lucide-react";

export function PortalSelectPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs"
        style={{ color: "var(--color-text-faint)" }}
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 justify-center mb-3">
          <Radio size={20} style={{ color: "var(--color-cyan)" }} className="live-dot" />
          <span
            className="font-data text-lg font-semibold tracking-widest uppercase"
            style={{ color: "var(--color-text)" }}
          >
            Sentinel
          </span>
        </div>
        <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Select how you'd like to sign in
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/login", { state: { portal: "admin" } })}
            className="text-left rounded-lg border p-6 transition-colors hover:border-opacity-60"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <ShieldCheck size={28} style={{ color: "var(--color-critical)" }} className="mb-4" />
            <h2 className="text-base font-semibold mb-1" style={{ color: "var(--color-text)" }}>
              Admin access
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              Full control over alerts, users, and audit history. Two-factor authentication will
              be required if enabled on the account.
            </p>
            <span
              className="font-data text-[10px] uppercase tracking-wide px-2 py-1 rounded-sm border"
              style={{ color: "var(--color-critical)", borderColor: "var(--color-critical)" }}
            >
              Admin only
            </span>
          </button>

          <button
            onClick={() => navigate("/login", { state: { portal: "standard" } })}
            className="text-left rounded-lg border p-6 transition-colors hover:border-opacity-60"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <User size={28} style={{ color: "var(--color-cyan)" }} className="mb-4" />
            <h2 className="text-base font-semibold mb-1" style={{ color: "var(--color-text)" }}>
              Analyst / Viewer access
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              Sign in to triage alerts or view the dashboard, depending on the access an admin has
              granted your account.
            </p>
            <span
              className="font-data text-[10px] uppercase tracking-wide px-2 py-1 rounded-sm border"
              style={{ color: "var(--color-cyan)", borderColor: "var(--color-cyan)" }}
            >
              Analyst / Viewer
            </span>
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-faint)" }}>
          New here?{" "}
          <Link to="/register" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
