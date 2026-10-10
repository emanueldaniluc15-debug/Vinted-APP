'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API, setToken } from '../../lib/api';
import { useStatus } from '../../components/Shell';

export default function Login() {
  const router = useRouter();
  const st = useStatus();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'No se pudo iniciar sesión.');
      setToken(d.token);
      await st.refresh();
      router.push('/');
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  return (
    <form className="panel" onSubmit={submit} style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>Entrar</h2>
      <p className="sub">Escribe la contraseña de tu app.</p>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" autoFocus />
      <div className="row"><button className="btn" disabled={busy || !password}>Entrar</button></div>
      {err && <div className="msg bad">{err}</div>}
    </form>
  );
}
