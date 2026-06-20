import { useEffect, useState, useCallback } from "react";
import { Users } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { SkeletonTableRows } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import * as usersApi from "../api/users";

const ROLES = ["viewer", "analyst", "admin"];

export function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");
    usersApi
      .listUsers()
      .then(setUsers)
      .catch((err) => setLoadError(err.response?.data?.detail || "Could not load users."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRoleChange(userId, newRole) {
    setActionError("");
    setBusyId(userId);
    try {
      const updated = await usersApi.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setActionError(err.response?.data?.detail || "Could not update role.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleActiveToggle(userId, isActive) {
    setActionError("");
    setBusyId(userId);
    try {
      const updated = await usersApi.updateUserActive(userId, isActive);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setActionError(err.response?.data?.detail || "Could not update account status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>
          Manage users
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          Promote, demote, or deactivate accounts. New accounts start as Viewer until granted more access.
        </p>

        {actionError && (
          <p className="text-xs mb-4" style={{ color: "var(--color-critical)" }}>{actionError}</p>
        )}

        {loadError ? (
          <ErrorState message="Couldn't load users." detail={loadError} onRetry={load} />
        ) : loading ? (
          <SkeletonTableRows rows={4} columns={5} />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No accounts found" />
        ) : (
          <div
            className="rounded-md border overflow-hidden"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ borderColor: "var(--color-border)" }}>
                  {["User", "Email", "Role", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-xs uppercase tracking-wide font-medium"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-3">
                        <p style={{ color: "var(--color-text)" }}>
                          {u.full_name || u.username}
                          {isSelf && (
                            <span className="text-xs ml-1.5" style={{ color: "var(--color-text-faint)" }}>(you)</span>
                          )}
                        </p>
                        <p className="font-data text-xs mt-0.5" style={{ color: "var(--color-text-faint)" }}>
                          @{u.username}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-data text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={busyId === u.id || (isSelf && u.role === "admin")}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs px-2 py-1.5 rounded-md border capitalize disabled:opacity-50"
                          style={{
                            borderColor: "var(--color-border-bright)",
                            backgroundColor: "var(--color-bg)",
                            color: "var(--color-text)",
                          }}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r} className="capitalize">{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            color: u.is_active ? "var(--color-low)" : "var(--color-text-faint)",
                            backgroundColor: u.is_active ? "rgba(232,115,46,0.1)" : "transparent",
                          }}
                        >
                          {u.is_active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleActiveToggle(u.id, !u.is_active)}
                          disabled={busyId === u.id || isSelf}
                          className="text-xs px-2.5 py-1.5 rounded-md border disabled:opacity-50"
                          style={{
                            borderColor: u.is_active ? "var(--color-critical)" : "var(--color-border-bright)",
                            color: u.is_active ? "var(--color-critical)" : "var(--color-text-muted)",
                          }}
                        >
                          {u.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
