import React from 'react';
import { useAuth, useRoute, navigate } from '../lib/context.jsx';

export function TopBar({ showBack, backTo = '/', group, nudgesEnabled, onToggleNudges }) {
  const { user, signOut } = useAuth();
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {showBack && (
          <button className="top-bar-back" onClick={() => navigate(backTo)} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <span className="top-bar-logo">MARROW</span>
      </div>

      <div>
        {group ? (
          <div className="top-bar-group-pill">{group.name}</div>
        ) : null}
      </div>

      <div className="top-bar-right">
        {group && onToggleNudges ? (
          <label className="nudge-toggle">
            Nudge
            <span
              className={`toggle-track ${nudgesEnabled ? 'on' : ''}`}
              onClick={onToggleNudges}
              role="switch"
              aria-checked={nudgesEnabled}
            >
              <span className="toggle-thumb"></span>
            </span>
          </label>
        ) : user ? (
          <>
            <span className="top-bar-user-email">{user.email}</span>
            <button className="top-bar-action" onClick={signOut}>Sign out</button>
          </>
        ) : null}
      </div>
    </header>
  );
}
