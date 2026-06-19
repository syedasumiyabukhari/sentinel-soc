import api from "./client";

export async function listUsers() {
  const { data } = await api.get("/api/users");
  return data;
}

export async function updateUserRole(userId, role) {
  const { data } = await api.patch(`/api/users/${userId}/role`, { role });
  return data;
}

export async function updateUserActive(userId, isActive) {
  const { data } = await api.patch(`/api/users/${userId}/active`, { is_active: isActive });
  return data;
}
