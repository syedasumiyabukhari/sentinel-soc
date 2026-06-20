import api from "./client";

export async function listAuditLogs(filters = {}) {
  const params = {};
  if (filters.action) params.action = filters.action;
  if (filters.target_type) params.target_type = filters.target_type;
  if (filters.target_id) params.target_id = filters.target_id;
  if (filters.limit) params.limit = filters.limit;
  if (filters.offset) params.offset = filters.offset;

  const { data } = await api.get("/api/audit-logs", { params });
  return data;
}
