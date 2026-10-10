export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const mediaUrl = (u) => (!u ? '' : u.startsWith('http') ? u : `${API}${u}`);

const KEY = 'vs_token';
export const getToken = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setToken = (t) => { try { localStorage.setItem(KEY, t); } catch {} };
export const clearToken = () => { try { localStorage.removeItem(KEY); } catch {} };
const authHeaders = () => (getToken() ? { Authorization: `Bearer ${getToken()}` } : {});

async function parse(res) {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    clearToken();
    window.location.href = '/login';
  }
  if (!res.ok) throw Object.assign(new Error(data.message || 'Error inesperado'), { code: data.code });
  return data;
}

export const api = (path, opts = {}) =>
  fetch(`${API}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...authHeaders() } }).then(parse);

export const upload = (path, formData) =>
  fetch(`${API}/api${path}`, { method: 'POST', body: formData, headers: authHeaders() }).then(parse);

// Descarga con sesión (un enlace normal no puede enviar la cabecera de autorización).
export async function download(path, fallbackName) {
  const res = await fetch(`${API}/api${path}`, { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.message || 'No se pudo descargar.');
  }
  const blob = await res.blob();
  const m = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = m ? m[1] : fallbackName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
