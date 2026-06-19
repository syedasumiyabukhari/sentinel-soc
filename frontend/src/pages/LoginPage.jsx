import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Radio, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function checkPasswordStrength(password) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One lowercase letter", pass: /[a-z]/.test(password) },
    { label: "One number", pass: /\d/.test(password) },
    { label: "One special character", pass: /[^\w\s]/.test(password) },
  ];
  const passed = checks.filter((c) => c.pass).length;
  return { checks, passed, total: checks.length };
}

export function LoginPage() {
  const { signIn, signUp, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = location.pathname === "/register" ? "register" : "login";
  const portal = location.state?.portal === "admin" ? "admin" : "standard";

  const [mode, setMode] = useState(initialMode); // login | register | 2fa
  const [form, setForm] = useState({ username: "", password: "", email: "", full_name: "" });
  const [twoFaToken, setTwoFaToken] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const strength = checkPasswordStrength(form.password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        const result = await signIn(form.username, form.password);
        if (result.requires2fa) {
          setTwoFaToken(result.twoFaToken);
          setMode("2fa");
        } else {
          navigate("/dashboard");
        }
      } else if (mode === "register") {
        await signUp(form);
        navigate("/dashboard");
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(" "));
      } else {
        setError(detail || "Something went wrong. Check your details and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify2fa(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await verifyTwoFactor(twoFaToken, code);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Incorrect code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Link
        to="/login-options"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs"
        style={{ color: "var(--color-text-faint)" }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>

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
          className="rounded-lg border p-6 shadow-2xl"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
            boxShadow: "0 20px 60px -20px rgba(240,143,176,0.12)",
          }}
        >
          {mode === "2fa" ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} style={{ color: "var(--color-cyan)" }} />
                <h1 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                  Enter your authentication code
                </h1>
              </div>
              <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
                Open your authenticator app and enter the 6-digit code for Sentinel.
              </p>
              <form onSubmit={handleVerify2fa} className="space-y-3">
                <Input
                  label="6-digit code"
                  value={code}
                  onChange={setCode}
                  required
                  autoFocus
                />
                {error && (
                  <p className="text-xs" style={{ color: "var(--color-critical)" }}>{error}</p>
                )}
                <button
                  type="submit"
                  disabled={busy || code.length < 6}
                  className="w-full mt-2 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-cyan)", color: "#2a1018" }}
                >
                  {busy ? "Verifying…" : "Verify and sign in"}
                </button>
              </form>
            </>
          ) : (
            <>
              {portal === "admin" && mode === "login" && (
                <div
                  className="flex items-center gap-2 text-xs mb-3 px-2.5 py-1.5 rounded-md"
                  style={{ backgroundColor: "rgba(240,143,176,0.1)", color: "var(--color-cyan)" }}
                >
                  <ShieldCheck size={13} />
                  Admin access — a two-factor code will be required if enabled on this account.
                </div>
              )}

              <h1 className="text-base font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                {mode === "login" ? "Sign in to the console" : "Create an account"}
              </h1>
              <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
                {mode === "login"
                  ? "Enter your credentials to access the triage queue."
                  : "Register a new account. New accounts start with read-only access until an admin grants more."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} required />
                {mode === "register" && (
                  <>
                    <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                    <Input label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                  </>
                )}
                <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />

                {mode === "register" && form.password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {Array.from({ length: strength.total }).map((_, i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full"
                          style={{
                            backgroundColor:
                              i < strength.passed
                                ? strength.passed === strength.total
                                  ? "var(--color-low)"
                                  : strength.passed >= 3
                                  ? "var(--color-medium)"
                                  : "var(--color-critical)"
                                : "var(--color-border-bright)",
                          }}
                        />
                      ))}
                    </div>
                    <ul className="text-xs mt-1.5 space-y-0.5">
                      {strength.checks.map((c) => (
                        <li
                          key={c.label}
                          style={{ color: c.pass ? "var(--color-low)" : "var(--color-text-faint)" }}
                        >
                          {c.pass ? "✓" : "·"} {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error && (
                  <p className="text-xs" style={{ color: "var(--color-critical)" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full mt-2 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-cyan)", color: "#2a1018" }}
                >
                  {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              <button
                onClick={() => {
                  setError("");
                  setMode(mode === "login" ? "register" : "login");
                }}
                className="text-xs mt-4 w-full text-center hover:underline"
                style={{ color: "var(--color-text-muted)" }}
              >
                {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, autoFocus }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        autoFocus={autoFocus}
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
