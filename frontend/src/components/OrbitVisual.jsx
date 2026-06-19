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
      className="absolute top-1/2 left-1/2 orbit-spin"
      style={{
        width: 0,
        height: 0,
        overflow: "visible",
        animationDuration: `${duration}s`,
        animationDirection: direction,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <div
        className="absolute flex flex-col items-center gap-1 orbit-counter-spin"
        style={{
          width: 0,
          height: 0,
          overflow: "visible",
          animationDuration: `${duration}s`,
          animationDirection: counterDirection,
          transform: `translateX(${radius}px)`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full border shrink-0"
          style={{
            width: 38,
            height: 38,
            fontSize: 18,
            borderColor: "var(--color-border-bright)",
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
    <div className="relative flex items-center justify-center" style={{ height: 340 }}>
      {/* Static orbit rings */}
      <div
        className="absolute rounded-full border"
        style={{ width: RING_RADIUS[1] * 2, height: RING_RADIUS[1] * 2, borderColor: "var(--color-border)" }}
      />
      <div
        className="absolute rounded-full border"
        style={{ width: RING_RADIUS[2] * 2, height: RING_RADIUS[2] * 2, borderColor: "var(--color-border)" }}
      />

      {/* Orbiting capability nodes */}
      {ORBIT_NODES.map((node) => (
        <OrbitNode key={node.label} {...node} />
      ))}

      {/* Central hub */}
      <div
        className="relative flex flex-col items-center justify-center rounded-full border z-10"
        style={{
          width: 96,
          height: 96,
          borderColor: "var(--color-cyan)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "0 0 40px -8px rgba(240,143,176,0.35)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full live-dot mb-1"
          style={{ backgroundColor: "var(--color-cyan)" }}
        />
        <span
          className="font-data text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--color-text)" }}
        >
          Sentinel
        </span>
      </div>
    </div>
  );
}
