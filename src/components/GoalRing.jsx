import React from 'react';

export function GoalRing({ value, target, label, onEdit }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, target > 0 ? value / target : 0);
  const off = c - pct * c;
  return (
    <div className="ring-tile-large">
      <div className="ring-svg-wrap-large">
        <svg viewBox="0 0 116 116">
          <circle className="ring-bg" cx="58" cy="58" r={r} />
          <circle
            className="ring-fg"
            cx="58" cy="58" r={r}
            strokeDasharray={c}
            strokeDashoffset={off}
          />
        </svg>
        <div className="ring-center">{value}/{target}</div>
        {onEdit && (
          <button className="ring-edit-icon" onClick={onEdit} aria-label={`Edit ${label} goal`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        )}
      </div>
      <div className="ring-tile-label">{label}</div>
    </div>
  );
}
