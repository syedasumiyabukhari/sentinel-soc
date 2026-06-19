import { NavLink } from "react-router-dom";
import { LayoutGrid, ShieldAlert, ScrollText, LogOut, Radio, Shield, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BASE_NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/alerts", label: "Alert Queue", icon: ShieldAlert },
  { to: "/audit", label: "Audit Log", icon: ScrollText },
  { to: "/settings", label: "Security Settings", icon: Shield },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navItems =
    user?.role === "admin"
      ? [...BASE_NAV_ITEMS, { to: "/users", label: "Manage Users", icon: Users }]
      : BASE_NAV_ITEMS;

  return (
    <aside
      className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Radio size={18} style={{ color: "var(--color-cyan)" }} className="live-dot" />
          <span className="font-data text-sm font-semibold tracking-widest uppercase" style={{ color: "var(--color-text)" }}>
            Sentinel
          </span>
        </div>
        <p className="font-data text-[10px] mt-1 tracking-wide" style={{ color: "var(--color-text-faint)" }}>
          SOC TRIAGE CONSOLE
        </p>
      </div>

      <div className="pulse-line" />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? "font-medium" : ""
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? "var(--color-cyan)" : "var(--color-text-muted)",
              backgroundColor: isActive ? "rgba(232,115,46,0.1)" : "transparent",
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {user?.full_name || user?.username}
          </p>
          <p className="font-data text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
            {user?.role}
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition-colors hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
