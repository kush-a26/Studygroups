import React, { useEffect, useState } from 'react';
import { Character } from './Character.jsx';

const SEAT_SLOTS = ['front', 'left', 'right', 'back-left', 'back-right'];

function useTick(ms = 1000, when = true) {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!when) return;
    const id = setInterval(() => setN(n => n + 1), ms);
    return () => clearInterval(id);
  }, [when, ms]);
}

function formatRemaining(ms) {
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatElapsed(ms) {
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Scene({
  members,
  activeSessions,
  myUserId,
  mySession,
  onStartFocus,
  onPauseFocus,
  onResumeFocus,
  onEndFocus,
  onNudge,
  canNudge,
}) {
  useTick(1000, true);

  // Build seat assignments
  const activeUserIds = new Set(activeSessions.map(s => s.user_id));
  const youActive = activeUserIds.has(myUserId);

  // Order: you (front), then active others, then inactive members
  // Filter to members who have an avatar set (avoid empty seats)
  const me = members.find(m => m.user_id === myUserId);
  const others = members.filter(m => m.user_id !== myUserId);

  const seated = [];
  if (youActive && me && me.avatar_organ) {
    seated.push({ ...me, seat: 'front', isActive: true, isYou: true });
  }

  // Place other members — active ones first, then inactive
  const activeOthers = others.filter(o => activeUserIds.has(o.user_id) && o.avatar_organ);
  const inactiveOthers = others.filter(o => !activeUserIds.has(o.user_id) && o.avatar_organ);
  const ordered = [...activeOthers, ...inactiveOthers];

  // Pick seat slots not taken by "you"
  const availableSlots = youActive
    ? SEAT_SLOTS.filter(s => s !== 'front')
    : SEAT_SLOTS;

  ordered.slice(0, availableSlots.length).forEach((m, i) => {
    seated.push({ ...m, seat: availableSlots[i], isActive: activeUserIds.has(m.user_id), isYou: false });
  });

  // Compute timer for "my" session
  let timerLabel = null;
  let timerValue = null;
  if (mySession) {
    const start = new Date(mySession.started_at).getTime();
    const pausedTotal = mySession.paused_total_ms || 0;
    const pausedNow = mySession.paused_at ? Date.now() - new Date(mySession.paused_at).getTime() : 0;
    const effectiveStart = start + pausedTotal + pausedNow;
    const elapsed = Math.max(0, Date.now() - effectiveStart);
    const total = mySession.duration_min * 60_000;
    const remaining = Math.max(0, total - elapsed);
    timerLabel = mySession.paused_at ? 'Paused' : 'You\u2019ve been studying for';
    timerValue = mySession.paused_at ? formatRemaining(remaining) : formatElapsed(elapsed);
  }

  // Generate static-ish books for the side shelves (visual decoration only)
  const shelfBookColors = ['#62487A', '#A03022', '#2B5F3F', '#7A3E22', '#B85A1F', '#1F5B7A', '#5A7A1F', '#7A1F5B', '#3F2B7A', '#2B5F7A'];

  return (
    <div className="scene-canvas">
      <div className="scene-bg">
        {/* Wall */}
        <div className="scene-window">
          <div className="scene-clouds"></div>
          <div className="scene-trees"></div>
        </div>

        {/* Bookshelves */}
        <div className="scene-shelf left">
          <div className="scene-shelf-books">
            {[0, 1, 2, 3].map(tier => (
              <div className="scene-shelf-tier" key={tier}>
                {[0, 1, 2, 3, 4].map(b => (
                  <div
                    key={b}
                    className="scene-shelf-book"
                    style={{ '--book-color': shelfBookColors[(tier * 5 + b) % shelfBookColors.length] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="scene-shelf right">
          <div className="scene-shelf-books">
            {[0, 1, 2, 3].map(tier => (
              <div className="scene-shelf-tier" key={tier}>
                {[0, 1, 2, 3, 4].map(b => (
                  <div
                    key={b}
                    className="scene-shelf-book"
                    style={{ '--book-color': shelfBookColors[(tier * 5 + b + 7) % shelfBookColors.length] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Chairs */}
        <div className="scene-chair left"></div>
        <div className="scene-chair right"></div>
        <div className="scene-chair back-left"></div>
        <div className="scene-chair back-right"></div>

        {/* Table */}
        <div className="scene-table">
          <div className="scene-table-items">
            <div className="scene-book"></div>
            <div className="scene-lamp"></div>
            <div className="scene-mug"></div>
          </div>
        </div>

        {/* Floor */}
        <div className="scene-floor"></div>
      </div>

      {/* Characters at seats */}
      <div className="seats">
        {seated.map(s => (
          <div key={s.user_id} className={`seat ${s.seat}`}>
            <Character
              membership={s}
              isActive={s.isActive}
              isYou={s.isYou}
              onNudge={() => onNudge(s.user_id)}
              canNudge={canNudge && !s.isActive && !s.isYou}
            />
          </div>
        ))}
      </div>

      {/* Timer pill (top right) when in focus */}
      {mySession && timerValue && (
        <div className="scene-timer-pill">
          <span className="scene-timer-label">{timerLabel}</span>
          <span className="scene-timer-value">{timerValue}</span>
        </div>
      )}

      {/* Empty CTA when you're not in focus */}
      {!mySession && (
        <div className={`scene-empty-cta ${seated.length > 0 ? 'has-others' : ''}`}>
          <div className="scene-empty-cta-card">
            <div>
              <h3>
                {seated.some(s => s.isActive)
                  ? 'Join the table'
                  : 'Start your focus block'}
              </h3>
              <p>
                {seated.filter(s => s.isActive).length > 0
                  ? `${seated.filter(s => s.isActive).length} ${seated.filter(s => s.isActive).length === 1 ? 'friend is' : 'friends are'} studying. Sit down with them.`
                  : 'Pick a timer and your character. Friends will appear here when they join.'}
              </p>
            </div>
            <button className="btn btn-primary" onClick={onStartFocus}>Start focus</button>
          </div>
        </div>
      )}

      {/* Pause / end button when in focus */}
      {mySession && (
        <button
          className="scene-pause-btn"
          onClick={mySession.paused_at ? onResumeFocus : onPauseFocus}
          onDoubleClick={onEndFocus}
          aria-label={mySession.paused_at ? 'Resume focus' : 'Pause focus (double-click to end)'}
          title={mySession.paused_at ? 'Resume' : 'Pause · double-click to end'}
        >
          {mySession.paused_at ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1"/>
              <rect x="14" y="5" width="4" height="14" rx="1"/>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
