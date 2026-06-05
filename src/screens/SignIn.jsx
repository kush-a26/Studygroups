import React, { useState } from 'react';
import { api } from '../lib/db.js';
import { TopBar } from '../components/TopBar.jsx';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [linkInfo, setLinkInfo] = useState(null);
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const t = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLinkInfo(api.requestMagicLink(t));
    setSubmitted(true);
  };

  return (
    <div className="app-shell">
      <TopBar />
      <div className="center-page">
        <div className="center-stack">
          <div className="card">
            {!submitted ? (
              <>
                <h1 className="card-title">Sign in</h1>
                <div className="card-divider"></div>
                <p className="card-subtitle">We&rsquo;ll send you a magic link. No password to remember.</p>
                <form onSubmit={onSubmit}>
                  <div className="field-row">
                    <label htmlFor="email" className="field-label">Email</label>
                    <input
                      id="email"
                      type="email"
                      autoFocus
                      className={`field-input ${error ? 'has-error' : ''}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                    />
                    {error && <div className="field-error">{error}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={!email} style={{ marginTop: 24 }}>
                    Send magic link
                  </button>
                </form>
              </>
            ) : (
              <div className="magic-success">
                <svg className="magic-illus" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="14" width="52" height="36" rx="4" />
                  <path d="M6 18l26 18 26-18" />
                </svg>
                <h1 className="card-title">Check your email</h1>
                <div className="card-divider"></div>
                <p className="card-subtitle">
                  We sent a sign-in link to<br/>
                  <span className="magic-success-email">{email}</span>
                </p>
                {linkInfo && (
                  <div className="magic-dev-link">
                    <strong>Prototype mode:</strong> no email is actually sent. Use this link to continue:
                    <div style={{ marginTop: 8 }}>
                      <a href={linkInfo.link}>{linkInfo.link}</a>
                    </div>
                  </div>
                )}
                <div className="actions center" style={{ marginTop: 20 }}>
                  <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setLinkInfo(null); }}>
                    Use a different email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
