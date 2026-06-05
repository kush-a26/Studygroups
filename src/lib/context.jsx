import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from './db.js';

/* ============================================================
   ROUTER — hash-based
   ============================================================ */
const RouterContext = createContext(null);
export const useRoute = () => useContext(RouterContext);

function parseHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const [pathRaw, queryRaw] = hash.split('?');
  const query = {};
  if (queryRaw) queryRaw.split('&').forEach(p => {
    const [k, v] = p.split('=');
    if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return { path: pathRaw || '/', query };
}

export function navigate(to) {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
}

export function Router({ children }) {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const h = () => setRoute(parseHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return (
    <RouterContext.Provider value={{ ...route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

/* ============================================================
   AUTH
   ============================================================ */
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.currentUser());
  const signOut = useCallback(() => {
    api.signOut();
    setUser(null);
    navigate('/');
  }, []);
  const refresh = useCallback(() => setUser(api.currentUser()), []);
  return (
    <AuthContext.Provider value={{ user, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ============================================================
   TOAST
   ============================================================ */
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback(msg => {
    setToast({ msg, id: Date.now() });
    setTimeout(() => setToast(null), 2400);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className="toast-wrap">
          <div className="toast">{toast.msg}</div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
