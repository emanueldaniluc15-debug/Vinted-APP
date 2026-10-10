'use client';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useStatus } from '../../components/Shell';
import { PRICE_DISCLAIMER, PRICE_PER_IMAGE_TEXT, PRICE_PER_MP_TEXT } from '../../lib/pricing';

const PROVIDER_LABEL = 'fal.ai · FLUX.1 [dev]';
const DEFAULT_MODEL = 'fal-ai/flux/dev/image-to-image';

export default function Settings() {
  const st = useStatus();
  const provider = (st.providers || []).find((p) => p.id === 'fal');
  const [apiKey, setApiKey] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const model = st.model || DEFAULT_MODEL;

  async function validate() {
    setBusy(true); setMsg({ text: 'Validando…' });
    try {
      await api('/settings/api-key', { method: 'POST', body: JSON.stringify({ provider: 'fal', apiKey, model }) });
      setApiKey(''); setMsg({ ok: true, text: 'Clave válida. Ya puedes añadir productos.' });
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    setBusy(false); st.refresh();
  }
  async function remove() {
    await api('/settings/api-key', { method: 'DELETE' });
    setMsg({ ok: true, text: 'Clave eliminada.' }); st.refresh();
  }

  return (
    <div className="panel">
      <h2>Proveedor de IA y clave de API</h2>
      <p className="sub">Las imágenes se generan con fal.ai. La clave se guarda cifrada en tu servidor (Supabase) y nunca se envía al navegador. Sin una clave validada, la app queda bloqueada.</p>
      <div className="row" style={{ marginTop: 0, marginBottom: 14 }}>
        <button className="btn" disabled>{PROVIDER_LABEL}</button>
      </div>
      <input type="password" placeholder={provider?.keyHint || 'Clave de fal.ai'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
      <p className="sub" style={{ marginTop: 6 }}>Consigue la clave en {provider?.keyUrl || 'fal.ai/dashboard/keys'}.</p>
      <p className="sub" style={{ marginTop: 14 }}>Modelo con foto de referencia (predeterminado)</p>
      <input type="text" value={model} readOnly />
      <p className="sub" style={{ marginTop: 6 }}>El modo Personalizado usa internamente {st.customModel || 'fal-ai/flux/dev'}.</p>
      <p className="sub" style={{ marginTop: 14 }}>
        <b>{PRICE_PER_MP_TEXT}</b>. Para una imagen cuadrada de 1024×1024: {PRICE_PER_IMAGE_TEXT.toLowerCase()}.<br />
        {PRICE_DISCLAIMER}
      </p>
      <div className="row">
        <button className="btn" onClick={validate} disabled={busy || !apiKey}>Validar clave</button>
        {st.configured && <button className="btn ghost" onClick={remove}>Quitar clave</button>}
      </div>
      {msg && <div className={`msg ${msg.ok === true ? 'ok' : msg.ok === false ? 'bad' : ''}`}>{msg.text}</div>}
    </div>
  );
}
