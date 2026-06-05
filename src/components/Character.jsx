import React, { useState } from 'react';
import { organById } from '../lib/catalog.js';

export function Character({ membership, isActive, isYou, onNudge, canNudge }) {
  const organ = organById(membership.avatar_organ);
  const [ringing, setRinging] = useState(false);

  if (!organ) return null;

  const onBellClick = (e) => {
    e.stopPropagation();
    if (!canNudge) return;
    setRinging(true);
    setTimeout(() => setRinging(false), 700);
    onNudge && onNudge();
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <img
          src={organ.img}
          alt={organ.name}
          className={`character-img ${isActive ? '' : 'inactive'}`}
          draggable={false}
        />
        {!isActive && (
          <button
            className={`character-bell ${ringing ? 'ringing' : ''}`}
            onClick={onBellClick}
            disabled={!canNudge}
            aria-label="Nudge"
            title={canNudge ? 'Send a nudge' : 'Already nudged recently'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
          </button>
        )}
      </div>
      <div className="character-name">
        {isYou ? 'You' : membership.display_name.split(' ').slice(-1)[0]}
      </div>
    </>
  );
}
