import { ShieldCheck, Globe2, ScrollText, Activity, Server, Lock } from "lucide-react";

/**
 * A central "Sentinel" hub with capability nodes orbiting it on staggered
 * rings, each at a different radius/speed so the motion doesn't feel
 * mechanically uniform. Pure CSS animation (transform + opacity only),
 * respects prefers-reduced-motion via the .orbit-spin rule in index.css.
 */
const ORBIT_NODES = [
  { icon: ShieldCheck, label: "Severity scoring", ring: 1, angle: 0, duration: 22 },
  { icon: Globe2, label: "IP reputation", ring: 2, angle: 60, duration: 30 },
  { icon: ScrollText, label: "Audit trail", ring: 1, angle: 150, duration: 22 },
  { icon: Activity, label: "Triage workflow", ring: 2, angle: 210, duration: 30 },
  { icon: Server, label: "Alert sources", ring: 1, angle: 270, duration: 22 },
  { icon: Lock, label: "2FA / auth", ring: 2, angle: 330, duration: 30 },
];

const RING_RADIUS = { 1: 92, 2: 142 };

function OrbitNode({ icon: Icon, label, ring, angle, duration }) {
  const radius = RING_RADIUS[ring];
  return (
    <div
      className="absolute top-1/2 left-1/2 orbit-spin"
      style={{
        width: 0,
        height: 0,
        animationDuration: `${duration}s`,
        animationDirection: ring === 2 ? "reverse" : "normal",
        transform: `rotate(${angle}deg)`,
      }}
    >
      <div
        className="absolute flex flex-col items-center gap-1 orbit-counter-spin"
        style={{
          width: 0,
          height: 0,
          animationDuration: `${duration}s`,
          animationDirection: ring === 2 ? "normal" : "reverse",
          transform: `translateX(${radius}px)`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full border shrink-0"
          style={{
            width: 38,
            height: 38,
            borderColor: "var(--color-border-bright)",
            backgroundColor: "var(--color-surface-raised)",
          }}
          title={label}
        >
          <Icon size={16} style={{ color: "var(--color-cyan)" }} />
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
          boxShadow: "0 0 40px -8px rgba(217,122,159,0.35)",
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
