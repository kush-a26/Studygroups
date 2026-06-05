import React, { useState, useEffect } from 'react';
import { api } from '../lib/db.js';
import { useRoute, useAuth, navigate } from '../lib/context.jsx';
import { TopBar } from '../components/TopBar.jsx';

export function Callback() {
  const { query } = useRoute();
  const { refresh } = useAuth();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const u = api.consumeMagicLink(query.token || '');
    if (u) {
      refresh();
      setTimeout(() => navigate('/'), 200);
    } else {
      setStatus('error');
    }
  }, []);

  return (
    <div className="app-shell">
      <TopBar />
      <div className="center-page">
        <div className="center-stack">
          <div className="card">
            {status === 'processing' ? (
              <>
                <h1 className="card-title">Signing you in&hellip;</h1>
                <div className="card-divider"></div>
                <p className="card-subtitle">One moment.</p>
              </>
            ) : (
              <>
                <h1 className="card-title">Link expired</h1>
                <div className="card-divider"></div>
                <p className="card-subtitle">This sign-in link has already been used or is invalid.</p>
                <div className="actions center">
                  <button className="btn btn-primary" onClick={() => navigate('/signin')}>
                    Request a new link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
