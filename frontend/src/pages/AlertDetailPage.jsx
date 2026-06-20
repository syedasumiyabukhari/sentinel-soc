import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Globe, Server, User as UserIcon, Hash, Shield,
  ExternalLink, Clock, ScrollText, MessageSquare, Send,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { SeverityBadge } from "../components/SeverityBadge";
import { StatusPill, STATUS_TRANSITIONS, STATUS_LABELS } from "../components/StatusPill";
import { Skeleton, SkeletonTableRows } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import * as alertsApi from "../api/alerts";
import * as auditApi from "../api/audit";

function Field({ icon: Icon, label, value, mono = true }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
      <Icon size={15} className="mt-0.5 shrink-0" style={{ color: "var(--color-text-faint)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>{label}</p>
        <p className={`text-sm mt-0.5 break-words ${mono ? "font-data" : ""}`} style={{ color: "var(--color-text)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ReputationMeter({ score }) {
  const color = score >= 70 ? "var(--color-critical)" : score >= 35 ? "var(--color-high)" : "var(--color-low)";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Abuse confidence</span>
        <span className="font-data text-lg font-semibold" style={{ color }}>{score}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
        <div style={{ width: `${score}%`, height: "100%", backgroundColor: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

const ACTION_LABELS = {
  alert_status_change: "Status changed",
  alert_assigned: "Alert assigned",
  alerts_generated: "Alert generated",
};

export function AlertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alert, setAlert] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState("");

  const canComment = user?.role === "admin" || user?.role === "analyst";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertsApi.getAlert(id);
      setAlert(data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "This alert doesn't exist or may have been deleted."
          : err.response
          ? `The server responded with an error (${err.response.status}).`
          : "Couldn't reach the backend. Is it running?"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await auditApi.listAuditLogs({ target_type: "alert", target_id: id, limit: 50 });
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const data = await alertsApi.listAlertComments(id);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    loadHistory();
    loadComments();
  }, [load, loadHistory, loadComments]);

  async function handleAddComment(e) {
    e.preventDefault();
    setCommentError("");
    setCommentBusy(true);
    try {
      const comment = await alertsApi.addAlertComment(id, commentBody);
      setComments((prev) => [...prev, comment]);
      setCommentBody("");
    } catch (err) {
      setCommentError(err.response?.data?.detail || "Couldn't post comment.");
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    setActionError("");
    try {
      const updated = await alertsApi.updateAlertStatus(alert.id, newStatus);
      setAlert(updated);
      await loadHistory();
    } catch (err) {
      setActionError(
        err.response?.status === 403
          ? "You don't have permission to change this alert's status."
          : "Couldn't update status. Try again."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-8 py-6">
          <ErrorState message="Couldn't load this alert." detail={error} onRetry={load} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6 max-w-4xl">
        <Link
          to="/alerts"
          className="inline-flex items-center gap-1.5 text-xs mb-5"
          style={{ color: "var(--color-text-faint)" }}
        >
          <ArrowLeft size={13} />
          Back to alert queue
        </Link>

        {loading ? (
          <div className="space-y-4">
            <Skeleton height={28} width="60%" />
            <Skeleton height={16} width="30%" />
            <Skeleton height={140} />
            <SkeletonTableRows rows={4} columns={2} />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <SeverityBadge severity={alert.severity} />
                  <StatusPill status={alert.status} />
                </div>
                <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                  {alert.title}
                </h1>
                <p className="font-data text-xs mt-1.5" style={{ color: "var(--color-text-faint)" }}>
                  ALERT #{alert.id} · Detected {new Date(alert.created_at).toLocaleString()}
                  {alert.closed_at && ` · Closed ${new Date(alert.closed_at).toLocaleString()}`}
                </p>
              </div>
            </div>

            {alert.description && (
              <p className="text-sm mt-4 mb-6" style={{ color: "var(--color-text-muted)" }}>
                {alert.description}
              </p>
            )}

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Network / event details */}
              <div
                className="rounded-md border p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--color-text-faint)" }}>
                  Event details
                </p>
                <Field icon={Globe} label="Source IP" value={alert.source_ip} />
                <Field icon={Server} label="Destination IP" value={alert.destination_ip} />
                <Field icon={Globe} label="Source country" value={alert.source_country} mono={false} />
                <Field icon={UserIcon} label="Targeted username" value={alert.username_targeted} />
                <Field icon={Hash} label="Port" value={alert.port} />
              </div>

              {/* IP reputation / enrichment */}
              <div
                className="rounded-md border p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "var(--color-text-faint)" }}>
                  IP reputation · AbuseIPDB
                </p>
                {alert.abuse_confidence_score !== null && alert.abuse_confidence_score !== undefined ? (
                  <>
                    <ReputationMeter score={alert.abuse_confidence_score} />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>Total reports</p>
                        <p className="font-data text-sm mt-0.5" style={{ color: "var(--color-text)" }}>
                          {alert.total_reports ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>TOR exit node</p>
                        <p
                          className="font-data text-sm mt-0.5 font-semibold"
                          style={{ color: alert.is_tor === "true" ? "var(--color-critical)" : "var(--color-text)" }}
                        >
                          {alert.is_tor === "true" ? "Yes" : alert.is_tor === "false" ? "No" : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: "var(--color-text-faint)" }}>
                    No reputation data available for this source IP.
                  </p>
                )}
              </div>
            </div>

            {/* MITRE ATT&CK mapping */}
            {alert.mitre_technique_id && (
              <div
                className="rounded-md border p-4 mb-6"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "var(--color-text-faint)" }}>
                  MITRE ATT&CK mapping
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-md border"
                    style={{ borderColor: "var(--color-border-bright)" }}
                  >
                    <Shield size={14} style={{ color: "var(--color-cyan)" }} />
                    <div>
                      <p className="font-data text-xs" style={{ color: "var(--color-text-faint)" }}>
                        {alert.mitre_tactic_id}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-text)" }}>{alert.mitre_tactic_name}</p>
                    </div>
                  </div>
                  <span style={{ color: "var(--color-text-faint)" }}>→</span>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-md border"
                    style={{ borderColor: "var(--color-border-bright)" }}
                  >
                    <div>
                      <p className="font-data text-xs" style={{ color: "var(--color-text-faint)" }}>
                        {alert.mitre_technique_id}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-text)" }}>{alert.mitre_technique_name}</p>
                    </div>
                  </div>
                  <a
                    href={alert.mitre_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs ml-auto"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    View on attack.mitre.org
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}

            {/* Triage actions */}
            <div
              className="rounded-md border p-4 mb-6"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "var(--color-text-faint)" }}>
                Update status
              </p>
              <div className="flex flex-wrap gap-2">
                {(STATUS_TRANSITIONS[alert.status] || []).map((next) => (
                  <button
                    key={next}
                    disabled={updating}
                    onClick={() => handleStatusChange(next)}
                    className="text-xs px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50"
                    style={{ borderColor: "var(--color-border-bright)", color: "var(--color-text)" }}
                  >
                    Move to {STATUS_LABELS[next]}
                  </button>
                ))}
                {(STATUS_TRANSITIONS[alert.status] || []).length === 0 && (
                  <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>
                    No further transitions available from this status.
                  </p>
                )}
              </div>
              {actionError && (
                <p className="text-xs mt-2" style={{ color: "var(--color-critical)" }}>{actionError}</p>
              )}
            </div>

            {/* Status history timeline */}
            <div
              className="rounded-md border p-4"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "var(--color-text-faint)" }}>
                Status history
              </p>
              {historyLoading ? (
                <div className="space-y-2">
                  <Skeleton height={14} />
                  <Skeleton height={14} width="80%" />
                </div>
              ) : history.length === 0 ? (
                <EmptyState icon={Clock} title="No history yet" body="Status changes for this alert will appear here." />
              ) : (
                <div className="relative pl-4">
                  <div
                    className="absolute left-1 top-1 bottom-1 w-px"
                    style={{ backgroundColor: "var(--color-border)" }}
                  />
                  {history.map((log) => (
                    <div key={log.id} className="relative pb-4 last:pb-0">
                      <span
                        className="absolute -left-3.5 top-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: "var(--color-cyan)" }}
                      />
                      <p className="text-sm" style={{ color: "var(--color-text)" }}>
                        {ACTION_LABELS[log.action] || log.action}
                        {log.actor_username && (
                          <span style={{ color: "var(--color-text-muted)" }}> by {log.actor_username}</span>
                        )}
                      </p>
                      {log.detail && (
                        <p className="font-data text-xs mt-0.5" style={{ color: "var(--color-text-faint)" }}>
                          {log.detail}
                        </p>
                      )}
                      <p className="font-data text-xs mt-0.5" style={{ color: "var(--color-text-faint)" }}>
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div
              className="rounded-md border p-4 mt-6"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} style={{ color: "var(--color-cyan)" }} />
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
                  Comments
                </p>
              </div>

              {commentsLoading ? (
                <div className="space-y-2">
                  <Skeleton height={14} />
                  <Skeleton height={14} width="70%" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm mb-3" style={{ color: "var(--color-text-faint)" }}>No comments yet.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: "var(--color-text)" }}>{c.author_username}</span>
                        <span className="font-data text-xs" style={{ color: "var(--color-text-faint)" }}>
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5" style={{ color: "var(--color-text-muted)" }}>{c.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {canComment ? (
                <form onSubmit={handleAddComment} className="flex items-start gap-2 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Add a note about this alert…"
                    rows={2}
                    className="flex-1 text-sm px-3 py-2 rounded-md border resize-none"
                    style={{
                      borderColor: "var(--color-border-bright)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={commentBusy || !commentBody.trim()}
                    className="p-2 rounded-md disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-cyan)", color: "#2a1606" }}
                  >
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <p className="text-xs pt-3 border-t" style={{ color: "var(--color-text-faint)", borderColor: "var(--color-border)" }}>
                  Viewer accounts can read comments but can't post new ones.
                </p>
              )}
              {commentError && (
                <p className="text-xs mt-2" style={{ color: "var(--color-critical)" }}>{commentError}</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
