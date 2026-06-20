import api from "./client";

export async function listAlerts(filters = {}) {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.severity) params.severity = filters.severity;
  if (filters.alert_type) params.alert_type = filters.alert_type;
  if (filters.source_ip) params.source_ip = filters.source_ip;
  if (filters.limit) params.limit = filters.limit;
  if (filters.offset) params.offset = filters.offset;

  const { data } = await api.get("/api/alerts", { params });
  return data;
}

export async function getAlert(id) {
  const { data } = await api.get(`/api/alerts/${id}`);
  return data;
}

export async function getStats() {
  const { data } = await api.get("/api/alerts/stats");
  return data;
}

export async function generateAlerts(count = 10) {
  const { data } = await api.post("/api/alerts/generate", { count });
  return data;
}

export async function updateAlertStatus(id, newStatus) {
  const { data } = await api.patch(`/api/alerts/${id}/status`, { status: newStatus });
  return data;
}

export async function assignAlert(id, userId) {
  const { data } = await api.patch(`/api/alerts/${id}/assign`, { user_id: userId });
  return data;
}

export async function getAlertHistory(id) {
  const { data } = await api.get(`/api/alerts/${id}/history`);
  return data;
}

export async function listAlertComments(id) {
  const { data } = await api.get(`/api/alerts/${id}/comments`);
  return data;
}

export async function addAlertComment(id, body) {
  const { data } = await api.post(`/api/alerts/${id}/comments`, { body });
  return data;
}

export async function deleteAlert(id) {
  await api.delete(`/api/alerts/${id}`);
}
