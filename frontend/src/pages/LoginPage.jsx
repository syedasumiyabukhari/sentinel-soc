import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", email: "", full_name: "", role: "analyst" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(form.username, form.password);
      } else {
        await signUp(form);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Radio size={20} style={{ color: "var(--color-cyan)" }} className="live-dot" />
          <span
            className="font-data text-lg font-semibold tracking-widest uppercase"
            style={{ color: "var(--color-text)" }}
          >
            Sentinel
          </span>
        </div>

        <div
          className="rounded-md border p-6"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h1 className="text-base font-semibold mb-1" style={{ color: "var(--color-text)" }}>
            {mode === "login" ? "Sign in to the console" : "Create an analyst account"}
          </h1>
          <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
            {mode === "login"
              ? "Enter your credentials to access the triage queue."
              : "Register a new account to start triaging alerts."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} required />
            {mode === "register" && (
              <>
                <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <Input label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                <div>
                  <label className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-md border text-sm"
                    style={{
                      borderColor: "var(--color-border-bright)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}
            <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />

            {error && (
              <p className="text-xs" style={{ color: "var(--color-critical)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "var(--color-cyan)", color: "#001318" }}
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-xs mt-4 w-full text-center hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md border text-sm"
        style={{
          borderColor: "var(--color-border-bright)",
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      />
    </div>
  );
}
