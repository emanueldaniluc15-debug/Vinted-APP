'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, mediaUrl } from '../lib/api';
import { useStatus } from '../components/Shell';

export default function Home() {
  const st = useStatus();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (st.isValid) api('/products').then(setProducts).catch(() => {});
  }, [st.isValid]);

  if (st.loading) return null;

  if (!st.isValid)
    return (
      <div className="banner">
        <div>
          <b>{st.offline ? 'No se puede conectar con el servidor.' : 'Configura la API para usar la app.'}</b>
          <br />
          <span className="sub">
            {st.offline ? 'Comprueba que la función vinted-api de Supabase está desplegada y que NEXT_PUBLIC_API_URL es correcta.' : 'Sin una clave válida en Ajustes, los productos y el botón + están bloqueados.'}
          </span>
        </div>
        {!st.offline && <Link className="btn" href="/settings">Ir a Ajustes</Link>}
      </div>
    );

  return (
    <>
      {products.length === 0 ? (
        <p className="sub">Aún no hay productos. Pulsa + para añadir el primero.</p>
      ) : (
        <div className="grid">
          {products.map((p) => {
            const first = p.images[0];
            const cover = first?.generations[0]?.resultUrl || first?.originalUrl;
            return (
              <Link className="pcard" key={p.id} href={`/products/${p.id}`}>
                <div className="scene">{cover && <img src={mediaUrl(cover)} alt="" />}</div>
                <b>{p.title || 'Sin título'}</b>
                <span className="sub" style={{ padding: '0 14px 12px', display: 'block' }}>
                  {p.style === 'CUSTOM' ? 'Personalizado' : p.style === 'HANGER' ? 'Con percha' : 'En superficie'} · {p.images.length} {p.style === 'CUSTOM' ? 'imagen' : 'fotos'}
                </span>
              </Link>
            );
          })}
        </div>
      )}
      <Link className="fab" href="/products/new" aria-label="Añadir producto">+</Link>
    </>
  );
}
