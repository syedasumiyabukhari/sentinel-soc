import api from "./client";

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const { data } = await api.post("/api/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  // Either { access_token, token_type, user } or { requires_2fa: true, two_fa_token }
  return data;
}

export async function verifyLogin2fa(twoFaToken, code) {
  const { data } = await api.post("/api/auth/login/verify-2fa", {
    two_fa_token: twoFaToken,
    code,
  });
  return data;
}

export async function register({ username, email, password, full_name }) {
  const { data } = await api.post("/api/auth/register", {
    username,
    email,
    password,
    full_name,
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function setup2fa() {
  const { data } = await api.post("/api/auth/2fa/setup");
  return data; // { qr_code_base64, secret }
}

export async function enable2fa(code) {
  const { data } = await api.post("/api/auth/2fa/enable", { code });
  return data;
}

export async function disable2fa(password, code) {
  const { data } = await api.post("/api/auth/2fa/disable", { password, code });
  return data;
}
