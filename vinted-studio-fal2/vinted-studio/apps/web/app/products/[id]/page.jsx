'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, download, mediaUrl } from '../../../lib/api';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [p, setP] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [ref, setRef] = useState({});
  const [msg, setMsg] = useState('');
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => api(`/products/${id}`).then(setP).catch((e) => setMsg(e.message)), [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (p && !loaded) { setTitle(p.title || ''); setDesc(p.description || ''); setLoaded(true); }
  }, [p, loaded]);

  const pending = p?.images.some((i) => i.generations[0]?.status === 'PENDING');
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(load, 2500);
    return () => clearTimeout(t);
  }, [pending, p, load]);

  if (!p) return <p className="sub">{msg || 'Cargando…'}</p>;
  const custom = p.style === 'CUSTOM';
  const anyDone = p.images.some((i) => i.generations[0]?.status === 'DONE');

  const act = async (fn, ok) => { try { await fn(); if (ok) setMsg(ok); load(); } catch (e) { setMsg(e.message); } };
  const save = () => act(() => api(`/products/${id}`, { method: 'PATCH', body: JSON.stringify({ title, description: desc }) }), 'Guardado.');
  const copy = (text, what) => navigator.clipboard.writeText(text).then(() => setMsg(`${what} copiado.`));
  const regen = () => act(() => api(`/products/${id}/generate`, { method: 'POST', body: '{}' }));
  const refine = (imageId) => act(async () => {
    await api(`/products/images/${imageId}/refine`, { method: 'POST', body: JSON.stringify({ text: ref[imageId] || '' }) });
    setRef({ ...ref, [imageId]: '' });
  });
  const dl = (path, name) => download(path, name).catch((e) => setMsg(e.message));
  const del = async () => { if (confirm('¿Eliminar este producto y sus fotos?')) { await api(`/products/${id}`, { method: 'DELETE' }); router.push('/'); } };

  return (
    <>
      <div className="panel">
        <h2>Título</h2>
        <p className="sub">Solo la prenda y la marca.</p>
        <input type="text" placeholder="Ej. Chaqueta The North Face" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="row"><button className="btn ghost" onClick={() => copy(title, 'Título')} disabled={!title}>Copiar título</button></div>
        <h2 style={{ marginTop: 18 }}>Descripción</h2>
        <p className="sub">Plantilla fija: rellena los huecos «___» y cópiala.</p>
        <textarea rows={8} value={desc} onChange={(e) => setDesc(e.target.value)} />
        <div className="row">
          <button className="btn" onClick={() => copy(desc, 'Descripción')}>Copiar descripción</button>
          <button className="btn ghost" onClick={save}>Guardar</button>
        </div>
        <div className="row">
          {anyDone && <button className="btn ghost" onClick={() => dl(`/products/${id}/export`, 'producto.zip')}>Descargar todo (.zip)</button>}
          <button className="btn ghost" onClick={regen} disabled={pending}>Volver a generar todo</button>
          <button className="btn ghost" onClick={del}>Eliminar</button>
        </div>
        {msg && <div className="msg ok">{msg}</div>}
      </div>
      {p.images.map((img) => {
        const g = img.generations[0];
        return (
          <div className="panel" key={img.id} style={{ marginTop: 16 }}>
            <div className="ba" style={custom ? { gridTemplateColumns: '1fr' } : undefined}>
              {!custom && <div><img className="o" src={mediaUrl(img.originalUrl)} alt="Original" /><span className="sub">Original</span></div>}
              <div>
                {g?.status === 'DONE' && <img className="o" src={mediaUrl(g.resultUrl)} alt="Generada" />}
                {g?.status === 'PENDING' && <div className="ph">Generando…</div>}
                {g?.status === 'FAILED' && <div className="ph bad">No se pudo generar.<br /><small>{g.error}</small></div>}
                <span className="sub">Generada</span>
              </div>
            </div>
            {custom && g?.prompt && <p className="sub">Prompt: {g.prompt}</p>}
            <div className="row" style={{ marginTop: 0 }}>
              {!custom && <input type="text" placeholder="Ajuste: ej. fondo un poco más claro" value={ref[img.id] || ''} onChange={(e) => setRef({ ...ref, [img.id]: e.target.value })} />}
              {!custom && <button className="btn ghost" disabled={g?.status === 'PENDING' || !(ref[img.id] || '').trim()} onClick={() => refine(img.id)}>Aplicar ajuste</button>}
              {g?.status === 'DONE' && <button className="btn ghost" onClick={() => dl(`/products/generations/${g.id}/download`, 'imagen.jpg')}>Descargar</button>}
            </div>
          </div>
        );
      })}
    </>
  );
}
