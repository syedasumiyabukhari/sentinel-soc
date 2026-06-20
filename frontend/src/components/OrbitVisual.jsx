import { Radio } from "lucide-react";

/**
 * A central "Sentinel" hub with project-themed emoji orbiting it on two
 * rings, each node spinning at its own radius, speed, and direction so
 * the motion reads as organic rather than a uniform clock mechanism.
 *
 * The 0x0 wrapper-div rotation trick needs `overflow: visible` explicitly -
 * without it, a zero-size container clips its children and the orbiting
 * nodes silently disappear even though they're animating correctly in the DOM.
 */
const ORBIT_NODES = [
  { emoji: "🛡️", label: "Severity scoring", ring: 1, angle: 0, duration: 18, direction: "normal" },
  { emoji: "🌐", label: "IP reputation", ring: 2, angle: 50, duration: 26, direction: "reverse" },
  { emoji: "📜", label: "Audit trail", ring: 1, angle: 140, duration: 21, direction: "reverse" },
  { emoji: "📡", label: "Triage workflow", ring: 2, angle: 200, duration: 24, direction: "normal" },
  { emoji: "🖥️", label: "Alert sources", ring: 1, angle: 250, duration: 16, direction: "normal" },
  { emoji: "🔒", label: "2FA / auth", ring: 2, angle: 320, duration: 29, direction: "reverse" },
];

const RING_RADIUS = { 1: 92, 2: 142 };

function OrbitNode({ emoji, label, ring, angle, duration, direction }) {
  const radius = RING_RADIUS[ring];
  const counterDirection = direction === "reverse" ? "normal" : "reverse";
  return (
    <div
      className="orbit-spin"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        overflow: "visible",
        zIndex: 5,
        animationDuration: `${duration}s`,
        animationDirection: direction,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <div
        className="orbit-counter-spin"
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          width: 0,
          height: 0,
          overflow: "visible",
          zIndex: 5,
          animationDuration: `${duration}s`,
          animationDirection: counterDirection,
          transform: `translateX(${radius}px)`,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: 38,
            height: 38,
            fontSize: 18,
            lineHeight: 1,
            borderRadius: "50%",
            border: "1px solid var(--color-border-bright)",
            backgroundColor: "var(--color-surface-raised)",
          }}
          title={label}
          role="img"
          aria-label={label}
        >
          {emoji}
        </div>
      </div>
    </div>
  );
}

export function OrbitVisual() {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 340 }}>
      {/* Static orbit rings */}
      <div
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: "1px solid var(--color-border)",
          width: RING_RADIUS[1] * 2,
          height: RING_RADIUS[1] * 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: "1px solid var(--color-border)",
          width: RING_RADIUS[2] * 2,
          height: RING_RADIUS[2] * 2,
        }}
      />

      {/* Orbiting capability nodes */}
      {ORBIT_NODES.map((node) => (
        <OrbitNode key={node.label} {...node} />
      ))}

      {/* Central hub */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          zIndex: 10,
          width: 96,
          height: 96,
          border: "1px solid var(--color-cyan)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "0 0 40px -8px rgba(232,115,46,0.35)",
        }}
      >
        <Radio
          size={20}
          className="live-dot"
          style={{ color: "var(--color-cyan)", marginBottom: 4 }}
        />
        <span
          className="font-data"
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-text)",
          }}
        >
          Sentinel
        </span>
      </div>
    </div>
  );
}
