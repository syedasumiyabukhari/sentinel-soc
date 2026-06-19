import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, ShieldCheck, Activity, Globe2, ScrollText, FolderGit2 } from "lucide-react";

const DEMO_ALERTS = [
  { id: 1, severity: "critical", title: "Brute force attempt detected", ip: "185.220.101.47", type: "brute_force" },
  { id: 2, severity: "high", title: "Port scan from external host", ip: "91.243.85.12", type: "port_scan" },
  { id: 3, severity: "medium", title: "Impossible travel login flagged", ip: "203.0.113.88", type: "impossible_travel" },
  { id: 4, severity: "critical", title: "Repeated failed login, admin account", ip: "45.155.205.33", type: "failed_login" },
  { id: 5, severity: "low", title: "New device login confirmed", ip: "172.67.34.21", type: "new_device" },
];

const SEVERITY_COLORS = {
  critical: "#e8556b",
  high: "#e8965c",
  medium: "#d9c45c",
  low: "#d97a9f",
};

function useTicker(items, intervalMs = 2600) {
  const [visible, setVisible] = useState(items.slice(0, 3));
  useEffect(() => {
    let i = 3 % items.length;
    const id = setInterval(() => {
      setVisible((prev) => {
        const next = [...prev.slice(1), items[i]];
        i = (i + 1) % items.length;
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [items, intervalMs]);
  return visible;
}

function timeNow(offsetSeconds) {
  const d = new Date(Date.now() - offsetSeconds * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Reveals a section with a fade+rise the first time it scrolls into view. */
function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

const FEATURES = [
  {
    icon: Activity,
    title: "Triage workflow",
    body: "Move alerts through New, Investigating, Escalated, and Closed, with valid transitions enforced server-side.",
  },
  {
    icon: ShieldCheck,
    title: "Severity scoring",
    body: "Every alert is scored by a rule-based engine and bucketed into critical, high, medium, or low automatically.",
  },
  {
    icon: Globe2,
    title: "IP reputation",
    body: "Source IPs are checked against AbuseIPDB for abuse confidence scores and TOR exit node detection.",
  },
  {
    icon: ScrollText,
    title: "Full audit trail",
    body: "Every login, status change, and assignment is logged with the actor, timestamp, and detail — nothing is silent.",
  },
];

function FeatureCard({ icon: Icon, title, body, delayMs }) {
  const [ref, visible] = useRevealOnScroll();
  return (
    <div
      ref={ref}
      className={`px-1 reveal-on-scroll ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      <Icon size={18} style={{ color: "var(--color-cyan)" }} className="mb-3" />
      <h3 className="text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{body}</p>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const tickerAlerts = useTicker(DEMO_ALERTS);

  return (
    <div
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Ambient drifting glow shapes - purely decorative, behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full glow-drift"
        style={{ background: "radial-gradient(circle, rgba(217,122,159,0.16), transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 right-0 w-[380px] h-[380px] rounded-full glow-drift-slow"
        style={{ background: "radial-gradient(circle, rgba(232,150,92,0.10), transparent 70%)", filter: "blur(50px)" }}
      />

      <div className="relative">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-10 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Radio size={18} style={{ color: "var(--color-cyan)" }} className="live-dot" />
            <span className="font-data text-sm font-semibold tracking-widest uppercase">Sentinel</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-sm px-3 py-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm px-4 py-1.5 rounded-md font-medium"
              style={{ backgroundColor: "var(--color-cyan)", color: "#2a1018" }}
            >
              Get started
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 md:px-10 max-w-6xl mx-auto pt-10 pb-16 md:pt-16 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p
              className="font-data text-xs uppercase tracking-widest mb-4 fade-up"
              style={{ color: "var(--color-cyan)", animationDelay: "0ms" }}
            >
              SOC Triage Console
            </p>
            <h1
              className="text-3xl md:text-4xl font-semibold leading-tight mb-4 fade-up"
              style={{ color: "var(--color-text)", animationDelay: "80ms" }}
            >
              Security operations,
              <br />
              without the noise.
            </h1>
            <p
              className="text-base mb-7 max-w-md fade-up"
              style={{ color: "var(--color-text-muted)", animationDelay: "160ms" }}
            >
              Sentinel scores, enriches, and routes alerts so analysts spend their time on real
              incidents — not scrolling a flat log.
            </p>
            <div className="flex items-center gap-3 fade-up" style={{ animationDelay: "240ms" }}>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 rounded-md text-sm font-medium"
                style={{ backgroundColor: "var(--color-cyan)", color: "#2a1018" }}
              >
                Get started
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-md text-sm font-medium border"
                style={{ borderColor: "var(--color-border-bright)", color: "var(--color-text)" }}
              >
                Sign in
              </button>
            </div>
          </div>

          {/* Live mini alert feed - the signature element */}
          <div
            className="rounded-md border overflow-hidden fade-up"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", animationDelay: "320ms" }}
          >
            <div
              className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="font-data text-xs uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
                Live alert feed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ backgroundColor: "var(--color-cyan)" }} />
                <span className="font-data text-xs" style={{ color: "var(--color-text-faint)" }}>watching</span>
              </span>
            </div>
            <div className="pulse-line" />
            <div>
              {tickerAlerts.map((alert, idx) => (
                <div
                  key={`${alert.id}-${idx}`}
                  className="relative flex items-center gap-3 px-4 py-3 border-b last:border-0 transition-opacity"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: SEVERITY_COLORS[alert.severity] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--color-text)" }}>{alert.title}</p>
                    <p className="font-data text-xs mt-0.5" style={{ color: "var(--color-text-faint)" }}>
                      {alert.ip} · {timeNow((3 - idx) * 7)}
                    </p>
                  </div>
                  <span
                    className="font-data text-[10px] uppercase px-1.5 py-0.5 rounded-sm border shrink-0"
                    style={{
                      color: SEVERITY_COLORS[alert.severity],
                      borderColor: SEVERITY_COLORS[alert.severity],
                    }}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="pulse-line max-w-6xl mx-auto" />

        {/* Feature strip */}
        <section className="px-6 md:px-10 max-w-6xl mx-auto py-14">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {FEATURES.map(({ icon, title, body }, idx) => (
              <FeatureCard key={title} icon={icon} title={title} body={body} delayMs={idx * 90} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          className="px-6 md:px-10 max-w-6xl mx-auto py-8 border-t flex items-center justify-between"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>
            Built by Sumiya Bukhari
          </p>
          <a
            href="https://github.com/syedasumiyabukhari"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            <FolderGit2 size={14} />
            GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
