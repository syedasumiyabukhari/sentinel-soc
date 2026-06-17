import api from "./client";

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const { data } = await api.post("/api/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data; // { access_token, token_type, user }
}

export async function register({ username, email, password, full_name, role }) {
  const { data } = await api.post("/api/auth/register", {
    username,
    email,
    password,
    full_name,
    role,
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}
