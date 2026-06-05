import React, { useMemo } from 'react';
import { api } from '../lib/db.js';
import { useAuth, navigate } from '../lib/context.jsx';
import { TopBar } from '../components/TopBar.jsx';

export function Landing() {
  const { user } = useAuth();
  const groups = useMemo(() => user ? api.listUserGroups(user.id) : [], [user]);

  const onSeed = () => {
    const g = api.seedDemoGroup(user.id);
    navigate(`/group/${g.id}`);
  };

  if (groups.length === 0) {
    return (
      <div className="app-shell">
        <TopBar />
        <div className="center-page" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: '100%', marginTop: '4vh' }}>
            <div className="landing-hero">
              <h1 className="landing-hero-title">Study groups</h1>
              <p className="landing-hero-subtitle">Groups focus on effort, not test scores.</p>
            </div>
            <div className="empty-fork">
              <h2 className="empty-fork-title">Get started</h2>
              <div className="empty-fork-divider"></div>
              <p className="empty-fork-text">Join an existing group with a friend&rsquo;s invite link, or start your own.</p>
              <div className="actions center">
                <button className="btn btn-secondary" onClick={() => navigate('/join')}>Join a group</button>
                <button className="btn btn-primary" onClick={() => navigate('/create')}>Create a group</button>
              </div>
              <p className="empty-fork-hint">You can be in multiple groups. Max 5 members each.</p>
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button className="btn btn-ghost btn-sm" onClick={onSeed}>Load demo group with friends</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className="center-page" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: '100%' }}>
          <div className="landing-hero" style={{ paddingTop: 'var(--space-5)' }}>
            <h1 className="landing-hero-title">Your study groups</h1>
            <p className="landing-hero-subtitle">{groups.length} {groups.length === 1 ? 'group' : 'groups'} · keep showing up</p>
          </div>
          <div className="group-list">
            {groups.map(g => (
              <button key={g.id} className="group-card" onClick={() => navigate(`/group/${g.id}`)}>
                <div className="group-card-header">
                  <div className="group-card-avatar">{g.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="group-card-name">{g.name}</div>
                    {g.description && <div className="group-card-goal">{g.description}</div>}
                  </div>
                </div>
                <div className="group-card-meta">
                  <span>{g.member_count} of 5 members</span>
                </div>
              </button>
            ))}
          </div>
          <div className="actions center" style={{ marginTop: 'var(--space-6)' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/join')}>Join another</button>
            <button className="btn btn-primary" onClick={() => navigate('/create')}>Create a group</button>
          </div>
        </div>
      </div>
    </div>
  );
}
