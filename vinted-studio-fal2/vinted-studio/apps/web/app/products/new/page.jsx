'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, upload } from '../../../lib/api';
import { PRICE_DISCLAIMER, PRICE_PER_IMAGE_TEXT, PRICE_PER_MP_TEXT, estimateCost } from '../../../lib/pricing';

const MODES = [
  { id: 'HANGER', name: 'Con percha', desc: 'Colgada en la pared, fondo gris' },
  { id: 'SURFACE', name: 'En superficie', desc: 'Plana sobre superficie gris' },
  { id: 'CUSTOM', name: 'Personalizado', desc: 'Prompt libre, sin subir fotos' },
];
const MAX_PROMPT = 2000;

export default function NewProduct() {
  const router = useRouter();
  const [mode, setMode] = useState(null);
  const [files, setFiles] = useState([]);
  const [extra, setExtra] = useState('');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const custom = mode === 'CUSTOM';
  const imageCount = custom ? 1 : files.length;
  const ready = custom ? prompt.trim().length > 0 : files.length > 0 && !!mode;

  async function go() {
    setBusy(true); setErr('');
    try {
      if (custom) {
        const p = await api('/custom/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
        router.push(`/products/${p.id}`);
        return;
      }
      const fd = new FormData();
      fd.append('style', mode);
      files.forEach((f) => fd.append('files', f));
      const p = await upload('/products', fd);
      await api(`/products/${p.id}/generate`, { method: 'POST', body: JSON.stringify({ style: mode, refinement: extra.trim() }) });
      router.push(`/products/${p.id}`);
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <>
      <div className="panel">
        <h2>1. Tipo de generación</h2>
        <p className="sub">Con percha y En superficie usan tu foto como referencia. Personalizado crea una imagen desde cero con tu prompt.</p>
        <div className="opts" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
          {MODES.map((m) => (
            <button key={m.id} className="opt" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
              <b>{m.name}</b><span>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {mode && !custom && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2>2. Fotos del producto</h2>
          <p className="sub">Selecciona todas las fotos de una vez (hasta 12, JPG, PNG o WebP, máx. 10 MB cada una).</p>
          <label className="drop">
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files))} />
            {files.length ? `${files.length} fotos seleccionadas. Toca para cambiarlas` : 'Toca para elegir fotos'}
          </label>
          <div className="thumbs">
            {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" />)}
          </div>
          <p className="sub" style={{ marginTop: 14 }}>Instrucciones adicionales (opcional)</p>
          <textarea rows={2} maxLength={500} placeholder="Ej. fondo un poco más claro" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </div>
      )}

      {custom && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2>2. Tu prompt</h2>
          <p className="sub">Describe la imagen que quieres. Se envía tal cual a fal.ai (en inglés suele funcionar mejor). No se sube ninguna foto.</p>
          <textarea rows={6} maxLength={MAX_PROMPT} placeholder="Ej. A cozy flat lay of folded knit sweaters on a wooden table, soft daylight" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <p className="sub" style={{ marginTop: 6 }}>{prompt.length}/{MAX_PROMPT}</p>
        </div>
      )}

      {mode && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2>3. Generar</h2>
          <p className="sub">
            {PRICE_PER_MP_TEXT}. {imageCount > 1 ? `Con ${imageCount} imágenes: ≈ ${estimateCost(imageCount)}.` : PRICE_PER_IMAGE_TEXT + '.'}<br />
            {PRICE_DISCLAIMER}
          </p>
          <div className="row">
            <button className="btn" disabled={busy || !ready} onClick={go}>
              {busy ? (custom ? 'Generando…' : 'Subiendo…') : 'Generar imágenes'}
            </button>
          </div>
          {err && <div className="msg bad">{err}</div>}
        </div>
      )}
    </>
  );
}
