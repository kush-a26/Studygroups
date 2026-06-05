import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { api } from '../lib/db.js';
import { useAuth, useRoute, useToast, navigate } from '../lib/context.jsx';
import { TopBar } from '../components/TopBar.jsx';
import { GoalRing } from '../components/GoalRing.jsx';
import { Scene } from '../components/Scene.jsx';
import { LibraryScene } from '../components/LibraryScene.jsx';
import { ModulesList } from '../components/ModulesList.jsx';
import {
  AvatarPickerModal, TimerPickerModal, GoalEditModal, ModuleSolveModal
} from '../components/Modals.jsx';

function thisWeekLabel() {
  const today = new Date();
  const day = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) => `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`;
  return `${fmt(start)} \u2014 ${fmt(end)}`;
}

export function Group() {
  const { user } = useAuth();
  const { path } = useRoute();
  const toast = useToast();
  const groupId = path.split('/').pop();

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(n => n + 1), []);

  const group = useMemo(() => api.getGroup(groupId), [groupId, tick]);
  const myMembership = useMemo(() => user ? api.getMembership(groupId, user.id) : null, [user, groupId, tick]);
  const members = useMemo(() => api.getGroupMembers(groupId), [groupId, tick]);
  const activeSessions = useMemo(() => api.getActiveFocusSessions(groupId), [groupId, tick]);
  const myProgress = useMemo(() => user ? api.weeklyProgress(groupId, user.id) : { mcqs: 0, videos: 0 }, [user, groupId, tick]);
  const groupStatus = useMemo(() => api.groupWeekStatus(groupId), [groupId, tick]);
  const badges = useMemo(() => api.listBadges(groupId), [groupId, tick]);
  const modules = useMemo(() => api.listModules(groupId), [groupId, tick]);

  const [tab, setTab] = useState('room'); // 'room' | 'library'
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(null); // 'mcq' | 'video' | null
  const [solvingModule, setSolvingModule] = useState(null);

  // Refresh every second so timers stay live
  useEffect(() => {
    const id = setInterval(refresh, 1000);
    return () => clearInterval(id);
  }, [refresh]);

  if (!group) {
    return (
      <div className="app-shell">
        <TopBar showBack />
        <div className="center-page">
          <div className="center-stack">
            <div className="card">
              <h1 className="card-title">Group not found</h1>
              <div className="card-divider"></div>
              <div className="actions center">
                <button className="btn btn-primary" onClick={() => navigate('/')}>Back to study groups</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!myMembership) {
    return (
      <div className="app-shell">
        <TopBar showBack />
        <div className="center-page">
          <div className="center-stack">
            <div className="card">
              <h1 className="card-title">You&rsquo;re not in this group</h1>
              <div className="card-divider"></div>
              <p className="card-subtitle">Ask a member for the invite code.</p>
              <div className="actions center">
                <button className="btn btn-primary" onClick={() => navigate('/')}>Back to study groups</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mySession = activeSessions.find(s => s.user_id === user.id);

  /* Actions */
  const onStartFocusClick = () => {
    if (!myMembership.avatar_organ) setShowAvatarPicker(true);
    else setShowTimerPicker(true);
  };

  const onAvatarPicked = (organ) => {
    api.setAvatar({ groupId, userId: user.id, organ });
    setShowAvatarPicker(false);
    setShowTimerPicker(true);
    refresh();
  };

  const onStartTimer = (durationMin) => {
    api.startFocus({ groupId, userId: user.id, durationMin });
    setShowTimerPicker(false);
    toast(`Focus started \u00b7 ${durationMin} min`);
    refresh();
  };

  const onPauseFocus = () => {
    if (mySession) {
      api.pauseFocus({ sessionId: mySession.id });
      refresh();
    }
  };
  const onResumeFocus = () => {
    if (mySession) {
      api.resumeFocus({ sessionId: mySession.id });
      refresh();
    }
  };
  const onEndFocus = () => {
    if (mySession) {
      api.endFocus({ sessionId: mySession.id });
      toast('Focus ended');
      refresh();
    }
  };

  const onNudge = (toUserId) => {
    if (api.recentNudge({ groupId, fromUserId: user.id, toUserId })) {
      toast('Already nudged recently \u00b7 give them a few minutes');
      return;
    }
    api.sendNudge({ groupId, fromUserId: user.id, toUserId });
    const target = members.find(m => m.user_id === toUserId);
    toast(`Nudged ${target ? target.display_name.split(' ').slice(-1)[0] : 'them'}`);
  };

  const onToggleNudges = () => {
    api.toggleNudges({ groupId, userId: user.id });
    refresh();
  };

  const onShareModule = (m) => {
    api.shareModule({ groupId, userId: user.id, ...m });
    refresh();
    toast('Module shared');
  };

  const onSaveGoals = ({ mcq, video }) => {
    api.setGoals({ groupId, userId: user.id, mcqGoal: mcq, videoGoal: video });
    setShowGoalEdit(null);
    refresh();
    toast('Goals updated');
  };

  const onLogProgress = (mcqs, videos) => {
    api.logProgress({ groupId, userId: user.id, mcqs, videos });
    refresh();
    const bits = [];
    if (mcqs) bits.push(`+${mcqs} MCQs`);
    if (videos) bits.push(`+${videos} video${videos > 1 ? 's' : ''}`);
    toast(`Logged \u00b7 ${bits.join(', ')}`);
  };

  const onUnlockBadge = () => {
    const badge = api.unlockRandomBadge(groupId);
    if (badge) toast('A new book joined the library');
    else toast('No more books to unlock this week');
    refresh();
  };

  const unlocked = groupStatus.onTrack >= groupStatus.threshold;

  return (
    <div className="app-shell">
      <TopBar
        showBack
        backTo="/"
        group={group}
        nudgesEnabled={myMembership.nudges_enabled}
        onToggleNudges={onToggleNudges}
      />

      <div className="dashboard">
        {/* Left sidebar */}
        <aside className="sidebar">
          <h2 className="sidebar-section-label">This week — {thisWeekLabel()}</h2>

          <div className="week-card">
            <GoalRing
              value={myProgress.mcqs}
              target={myMembership.mcq_goal}
              label="MCQs"
              onEdit={() => setShowGoalEdit('goals')}
            />
            <GoalRing
              value={myProgress.videos}
              target={myMembership.video_goal}
              label="Videos watched"
              onEdit={() => setShowGoalEdit('goals')}
            />
          </div>

          {unlocked && (
            <button className="btn btn-primary btn-sm btn-block" onClick={onUnlockBadge}>
              Claim this week&rsquo;s book
            </button>
          )}

          {!unlocked && (
            <p style={{
              font: 'var(--font-subtext-1)',
              color: 'var(--color-on-surface-varient)',
              textAlign: 'center',
              padding: '0 var(--space-2)',
            }}>
              {groupStatus.threshold - groupStatus.onTrack} more member{groupStatus.threshold - groupStatus.onTrack === 1 ? '' : 's'} at 50% to unlock this week&rsquo;s book
            </p>
          )}

          <ModulesList
            modules={modules}
            onShare={onShareModule}
            onSolve={setSolvingModule}
          />

          {/* Dev tools — for testing without Marrow integration */}
          <div className="progress-logger">
            <div className="progress-logger-title">Prototype tools</div>
            <div>Until Marrow integration ships, log fake progress:</div>
            <div className="progress-logger-row" style={{ marginTop: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => onLogProgress(10, 0)}>+10 MCQs</button>
              <button className="btn btn-secondary btn-sm" onClick={() => onLogProgress(50, 0)}>+50 MCQs</button>
              <button className="btn btn-secondary btn-sm" onClick={() => onLogProgress(0, 1)}>+1 video</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/invite/${group.id}`)}
                style={{ padding: 0 }}
              >
                Invite more members →
              </button>
            </div>
          </div>
        </aside>

        {/* Right scene area */}
        <main className="scene-area">
          <div className="scene-tab-switcher">
            <button
              className={`scene-tab ${tab === 'room' ? 'active' : ''}`}
              onClick={() => setTab('room')}
            >
              Study Room
            </button>
            <button
              className={`scene-tab ${tab === 'library' ? 'active' : ''}`}
              onClick={() => setTab('library')}
            >
              {badges.length > 0 && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              Library
            </button>
          </div>

          {tab === 'room' ? (
            <Scene
              members={members}
              activeSessions={activeSessions}
              myUserId={user.id}
              mySession={mySession}
              onStartFocus={onStartFocusClick}
              onPauseFocus={onPauseFocus}
              onResumeFocus={onResumeFocus}
              onEndFocus={onEndFocus}
              onNudge={onNudge}
              canNudge={myMembership.nudges_enabled}
            />
          ) : (
            <LibraryScene badges={badges} mySession={mySession} />
          )}
        </main>
      </div>

      {showAvatarPicker && (
        <AvatarPickerModal onSave={onAvatarPicked} onCancel={() => setShowAvatarPicker(false)} />
      )}
      {showTimerPicker && (
        <TimerPickerModal onStart={onStartTimer} onCancel={() => setShowTimerPicker(false)} />
      )}
      {showGoalEdit && (
        <GoalEditModal
          currentMcq={myMembership.mcq_goal}
          currentVideo={myMembership.video_goal}
          onSave={onSaveGoals}
          onCancel={() => setShowGoalEdit(null)}
        />
      )}
      {solvingModule && (
        <ModuleSolveModal module={solvingModule} onClose={() => setSolvingModule(null)} />
      )}
    </div>
  );
}
