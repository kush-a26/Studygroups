import React from 'react';
import { TEXTBOOKS } from '../lib/catalog.js';

export function LibraryScene({ badges, mySession }) {
  const earnedIds = new Set(badges.map(b => b.book_id));
  const slots = TEXTBOOKS.map(t => ({ ...t, earned: earnedIds.has(t.id) }));
  // Split into 4 rows
  const perRow = Math.ceil(slots.length / 4);
  const rows = [];
  for (let i = 0; i < 4; i++) {
    rows.push(slots.slice(i * perRow, (i + 1) * perRow));
  }

  let timerValue = null;
  if (mySession) {
    const start = new Date(mySession.started_at).getTime();
    const pausedTotal = mySession.paused_total_ms || 0;
    const pausedNow = mySession.paused_at ? Date.now() - new Date(mySession.paused_at).getTime() : 0;
    const effectiveStart = start + pausedTotal + pausedNow;
    const elapsed = Math.max(0, Date.now() - effectiveStart);
    const m = Math.floor(elapsed / 60_000);
    const s = Math.floor((elapsed % 60_000) / 1000);
    timerValue = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return (
    <div className="library-canvas">
      <div className="library-shelf">
        {rows.map((row, i) => (
          <div className="library-shelf-row" key={i}>
            {row.map(book => (
              <div
                key={book.id}
                className={`library-book ${book.earned ? '' : 'locked'}`}
                style={book.earned ? { background: book.color } : undefined}
                title={book.earned ? book.name : 'Locked'}
              >
                <span className="library-book-title">{book.earned ? book.name : '???'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="library-floor"></div>

      {/* Timer pill in bottom-left when in focus */}
      {mySession && timerValue && (
        <div className="scene-timer-pill" style={{ bottom: 'var(--space-4)', top: 'auto', left: 'var(--space-4)', right: 'auto' }}>
          <span className="scene-timer-value">{timerValue}</span>
        </div>
      )}
    </div>
  );
}
