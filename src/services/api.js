const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const headers = Object.assign({}, opts.headers || {});

  // Attach JSON content-type unless using FormData
  if (!(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach Authorization header automatically when token is present
  const token = localStorage.getItem('leco_jwt');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...opts, headers, credentials: opts.credentials || 'same-origin' });
  if (res.status === 204) return null;
  const text = await res.text();
  if (!res.ok) {
    let err = text || res.statusText;
    try { err = JSON.parse(text).message || JSON.stringify(JSON.parse(text)); } catch(e){}
    throw new Error(err);
  }
  try { return JSON.parse(text); } catch (e) { return text; }
}

export async function register(payload) {
  const res = await request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  // store token automatically if backend returns it
  const token = (res && (res.token || res.jwt || res.accessToken)) || (typeof res === 'string' ? res : null);
  if (token) setToken(token);
  return res;
}

export async function login(payload) {
  const res = await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  const token = (res && (res.token || res.jwt || res.accessToken)) || (typeof res === 'string' ? res : null);
  if (token) setToken(token);
  return res;
}

export async function requestReset(email) {
  // backend expects POST with query param
  return request(`/auth/request-reset?email=${encodeURIComponent(email)}`, { method: 'POST' });
}

export async function resetPassword(token, newPassword) {
  return request(`/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`, { method: 'POST' });
}

export async function verifyEmail(token) {
  return request(`/auth/verify-email?token=${encodeURIComponent(token)}`, { method: 'POST' });
}

export async function verifyCaptcha(captchaToken) {
  return request(`/auth/verify-captcha?captchaToken=${encodeURIComponent(captchaToken)}`, { method: 'POST' });
}

export async function getMe() {
  return request('/api/me', { method: 'GET' });
}

export function getToken() {
  return localStorage.getItem('leco_jwt');
}

export function setToken(token) {
  if (token) localStorage.setItem('leco_jwt', token);
  else localStorage.removeItem('leco_jwt');
}
