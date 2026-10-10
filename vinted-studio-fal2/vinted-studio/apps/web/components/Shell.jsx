'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api, clearToken } from '../lib/api';

const Ctx = createContext(null);
export const useStatus = () => useContext(Ctx);

export default function Shell({ children }) {
  const [st, setSt] = useState({ loading: true, isValid: false, model: '' });
  const path = usePathname();
  const router = useRouter();
  const refresh = useCallback(
    () =>
      api('/settings/status')
        .then((s) => setSt({ loading: false, ...s }))
        .catch(() => setSt({ loading: false, isValid: false, offline: true })),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);
  const logout = () => { clearToken(); setSt({ loading: false, isValid: false }); router.push('/login'); };

  return (
    <Ctx.Provider value={{ ...st, refresh }}>
      <header>
        <h1>Vinted Studio</h1>
        <span className={`pill ${st.isValid ? 'ok' : 'no'}`}>
          {st.loading ? '…' : st.isValid ? 'API activa' : 'API sin configurar'}
        </span>
        <nav>
          <Link className="tab" aria-current={path === '/'} href="/">Productos</Link>
          <Link className="tab" aria-current={path === '/settings'} href="/settings">Ajustes</Link>
          {path !== '/login' && <button className="tab" onClick={logout}>Salir</button>}
        </nav>
      </header>
      <main>{children}</main>
    </Ctx.Provider>
  );
}
