import { useState } from "react";
import { ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState("idle"); // idle | setup | disable
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function startSetup() {
    setError("");
    setBusy(true);
    try {
      const data = await authApi.setup2fa();
      setQr(data.qr_code_base64);
      setSecret(data.secret);
      setStep("setup");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not start 2FA setup.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmEnable(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authApi.enable2fa(code);
      setStep("idle");
      setCode("");
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.detail || "Incorrect code.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authApi.disable2fa(disablePassword, disableCode);
      setStep("idle");
      setDisablePassword("");
      setDisableCode("");
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not disable 2FA.");
    } finally {
      setBusy(false);
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6 max-w-2xl">
        <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>
          Security settings
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          Manage two-factor authentication for your account.
        </p>

        <div
          className="rounded-md border p-5"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user?.totp_enabled ? (
                <ShieldCheck size={20} style={{ color: "var(--color-low)" }} />
              ) : (
                <ShieldOff size={20} style={{ color: "var(--color-text-faint)" }} />
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Two-factor authentication
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {user?.totp_enabled
                    ? "Enabled — your account requires an authenticator code at login."
                    : "Not enabled — add an extra layer of protection to your account."}
                </p>
              </div>
            </div>
            {step === "idle" && (
              <button
                onClick={user?.totp_enabled ? () => setStep("disable") : startSetup}
                disabled={busy}
                className="text-xs px-3 py-2 rounded-md border font-medium shrink-0 disabled:opacity-50"
                style={{
                  borderColor: user?.totp_enabled ? "var(--color-critical)" : "var(--color-cyan)",
                  color: user?.totp_enabled ? "var(--color-critical)" : "var(--color-cyan)",
                }}
              >
                {user?.totp_enabled ? "Disable" : "Enable 2FA"}
              </button>
            )}
          </div>

          {step === "setup" && (
            <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-sm mb-3" style={{ color: "var(--color-text)" }}>
                1. Scan this QR code with Google Authenticator, Authy, or any TOTP app.
              </p>
              {qr && (
                <img
                  src={`data:image/png;base64,${qr}`}
                  alt="2FA QR code"
                  className="rounded-md border mb-3"
                  style={{ borderColor: "var(--color-border)", width: 180, height: 180 }}
                />
              )}
              <p className="text-xs mb-1" style={{ color: "var(--color-text-faint)" }}>
                Can't scan? Enter this code manually:
              </p>
              <div className="flex items-center gap-2 mb-4">
                <code
                  className="font-data text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: "var(--color-bg)", color: "var(--color-cyan)" }}
                >
                  {secret}
                </code>
                <button onClick={copySecret} style={{ color: "var(--color-text-muted)" }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <p className="text-sm mb-2" style={{ color: "var(--color-text)" }}>
                2. Enter the 6-digit code from the app to confirm setup.
              </p>
              <form onSubmit={confirmEnable} className="flex items-center gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  autoFocus
                  className="font-data px-3 py-2 rounded-md border text-sm w-32"
                  style={{
                    borderColor: "var(--color-border-bright)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text)",
                  }}
                />
                <button
                  type="submit"
                  disabled={busy || code.length < 6}
                  className="text-xs px-3 py-2 rounded-md font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-cyan)", color: "#2a1018" }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setStep("idle")}
                  className="text-xs px-3 py-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {step === "disable" && (
            <form
              onSubmit={confirmDisable}
              className="mt-5 pt-5 border-t space-y-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--color-text)" }}>
                Confirm your password and current authenticator code to disable 2FA.
              </p>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  borderColor: "var(--color-border-bright)",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text)",
                }}
              />
              <input
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="6-digit code"
                className="font-data w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  borderColor: "var(--color-border-bright)",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text)",
                }}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="text-xs px-3 py-2 rounded-md font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-critical)", color: "#1a0006" }}
                >
                  Disable 2FA
                </button>
                <button
                  type="button"
                  onClick={() => setStep("idle")}
                  className="text-xs px-3 py-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {error && (
            <p className="text-xs mt-3" style={{ color: "var(--color-critical)" }}>
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
