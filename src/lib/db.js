// Mock backend using localStorage.
// All functions here have the same shape they'd have if backed by Supabase —
// swap implementations in this file without touching the rest of the app.

import { TEXTBOOKS } from './catalog.js';

const STORAGE_KEY = 'marrow_sg_v4';
const SESSION_KEY = 'marrow_session_v1';

function emptyDb() {
  return {
    users: [],
    groups: [],
    memberships: [],
    focus_sessions: [],
    shared_modules: [],
    nudges: [],
    progress_logs: [],
    week_badges: [],
    invites: [],
    magic_tokens: {},
  };
}

function loadDb() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : emptyDb(); }
  catch { return emptyDb(); }
}
function saveDb(db) { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function inviteCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MARROW-${part()}${part().slice(0, 3)}`;
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function loadSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; } }
function saveSession(s) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

export const api = {
  /* ===== AUTH ===== */
  requestMagicLink(email) {
    const db = loadDb();
    const token = Math.random().toString(36).slice(2, 12);
    db.magic_tokens[token] = { email: email.toLowerCase().trim(), createdAt: Date.now() };
    saveDb(db);
    const base = window.location.origin + window.location.pathname;
    return { token, link: `${base}#/auth/callback?token=${token}` };
  },

  consumeMagicLink(token) {
    const db = loadDb();
    const entry = db.magic_tokens[token];
    if (!entry) return null;
    let user = db.users.find(u => u.email === entry.email);
    if (!user) {
      user = {
        id: uuid(),
        email: entry.email,
        display_name: entry.email.split('@')[0],
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
    }
    delete db.magic_tokens[token];
    saveDb(db);
    saveSession({ user_id: user.id, email: user.email });
    return user;
  },

  currentUser() {
    const s = loadSession();
    if (!s) return null;
    return loadDb().users.find(u => u.id === s.user_id) || null;
  },

  signOut() { clearSession(); },

  /* ===== GROUPS ===== */
  listUserGroups(userId) {
    const db = loadDb();
    const groupIds = db.memberships.filter(m => m.user_id === userId).map(m => m.group_id);
    return db.groups
      .filter(g => groupIds.includes(g.id))
      .map(g => ({ ...g, member_count: db.memberships.filter(m => m.group_id === g.id).length }));
  },

  getGroup(groupId) { return loadDb().groups.find(g => g.id === groupId); },

  getMembership(groupId, userId) {
    return loadDb().memberships.find(m => m.group_id === groupId && m.user_id === userId);
  },

  getGroupMembers(groupId) {
    const db = loadDb();
    return db.memberships
      .filter(m => m.group_id === groupId)
      .map(m => {
        const u = db.users.find(x => x.id === m.user_id);
        return u ? { ...u, ...m } : null;
      })
      .filter(Boolean);
  },

  createGroup({ name, description, mcqGoal, videoGoal, userId }) {
    const db = loadDb();
    const group = {
      id: uuid(),
      name: name.trim(),
      description: (description || '').trim(),
      default_mcq_goal: mcqGoal,
      default_video_goal: videoGoal,
      invite_code: inviteCode(),
      created_by: userId,
      created_at: new Date().toISOString(),
    };
    db.groups.push(group);
    db.memberships.push({
      id: uuid(),
      user_id: userId,
      group_id: group.id,
      avatar_organ: null,
      mcq_goal: mcqGoal,
      video_goal: videoGoal,
      nudges_enabled: true,
      role: 'admin',
      joined_at: new Date().toISOString(),
    });
    saveDb(db);
    return group;
  },

  joinGroup({ code, userId }) {
    const db = loadDb();
    const group = db.groups.find(g => g.invite_code.toUpperCase() === code.toUpperCase().trim());
    if (!group) return { error: 'No group found with that code' };
    const memberCount = db.memberships.filter(m => m.group_id === group.id).length;
    if (memberCount >= 5) return { error: 'This group is full (5 members max)' };
    const already = db.memberships.find(m => m.group_id === group.id && m.user_id === userId);
    if (already) return { error: 'You are already in this group', group };
    db.memberships.push({
      id: uuid(),
      user_id: userId,
      group_id: group.id,
      avatar_organ: null,
      mcq_goal: group.default_mcq_goal || 200,
      video_goal: group.default_video_goal || 8,
      nudges_enabled: true,
      role: 'member',
      joined_at: new Date().toISOString(),
    });
    saveDb(db);
    return { group };
  },

  setAvatar({ groupId, userId, organ }) {
    const db = loadDb();
    const m = db.memberships.find(x => x.group_id === groupId && x.user_id === userId);
    if (m) { m.avatar_organ = organ; saveDb(db); }
  },

  setGoals({ groupId, userId, mcqGoal, videoGoal }) {
    const db = loadDb();
    const m = db.memberships.find(x => x.group_id === groupId && x.user_id === userId);
    if (m) { m.mcq_goal = mcqGoal; m.video_goal = videoGoal; saveDb(db); }
  },

  toggleNudges({ groupId, userId }) {
    const db = loadDb();
    const m = db.memberships.find(x => x.group_id === groupId && x.user_id === userId);
    if (m) { m.nudges_enabled = !m.nudges_enabled; saveDb(db); return m.nudges_enabled; }
    return null;
  },

  inviteByEmail({ groupId, emails, fromUserId }) {
    const db = loadDb();
    emails.forEach(email => {
      db.invites.push({
        id: uuid(), group_id: groupId, email: email.toLowerCase().trim(),
        invited_by: fromUserId, created_at: new Date().toISOString(),
      });
    });
    saveDb(db);
    return { count: emails.length };
  },

  /* ===== FOCUS SESSIONS ===== */
  startFocus({ groupId, userId, durationMin }) {
    const db = loadDb();
    db.focus_sessions.forEach(s => {
      if (s.user_id === userId && s.group_id === groupId && !s.ended_at) {
        s.ended_at = new Date().toISOString();
      }
    });
    const session = {
      id: uuid(), user_id: userId, group_id: groupId,
      started_at: new Date().toISOString(),
      duration_min: durationMin,
      paused_at: null, paused_total_ms: 0,
      ended_at: null,
    };
    db.focus_sessions.push(session);
    saveDb(db);
    return session;
  },

  pauseFocus({ sessionId }) {
    const db = loadDb();
    const s = db.focus_sessions.find(x => x.id === sessionId);
    if (s && !s.ended_at && !s.paused_at) {
      s.paused_at = new Date().toISOString();
      saveDb(db);
    }
  },

  resumeFocus({ sessionId }) {
    const db = loadDb();
    const s = db.focus_sessions.find(x => x.id === sessionId);
    if (s && !s.ended_at && s.paused_at) {
      const pausedFor = Date.now() - new Date(s.paused_at).getTime();
      s.paused_total_ms = (s.paused_total_ms || 0) + pausedFor;
      s.paused_at = null;
      saveDb(db);
    }
  },

  endFocus({ sessionId }) {
    const db = loadDb();
    const s = db.focus_sessions.find(x => x.id === sessionId);
    if (s && !s.ended_at) {
      s.ended_at = new Date().toISOString();
      saveDb(db);
    }
  },

  getActiveFocusSessions(groupId) {
    const db = loadDb();
    const now = Date.now();
    return db.focus_sessions.filter(s => {
      if (s.group_id !== groupId) return false;
      if (s.ended_at) return false;
      const startMs = new Date(s.started_at).getTime();
      const pausedMs = s.paused_at ? (now - new Date(s.paused_at).getTime()) : 0;
      const effectiveStart = startMs + (s.paused_total_ms || 0) + pausedMs;
      const end = effectiveStart + s.duration_min * 60_000;
      return end > now;
    });
  },

  /* ===== NUDGES ===== */
  sendNudge({ groupId, fromUserId, toUserId }) {
    const db = loadDb();
    db.nudges.push({
      id: uuid(), group_id: groupId, from_user: fromUserId,
      to_user: toUserId, created_at: new Date().toISOString(),
    });
    saveDb(db);
  },

  recentNudge({ groupId, fromUserId, toUserId, withinMs = 10 * 60_000 }) {
    const db = loadDb();
    const cutoff = Date.now() - withinMs;
    return db.nudges.some(n =>
      n.group_id === groupId &&
      n.from_user === fromUserId &&
      n.to_user === toUserId &&
      new Date(n.created_at).getTime() > cutoff
    );
  },

  /* ===== MODULES ===== */
  shareModule({ groupId, userId, code, mcqs, subjects }) {
    const db = loadDb();
    db.shared_modules.push({
      id: uuid(),
      group_id: groupId,
      shared_by: userId,
      code: code.trim().toUpperCase(),
      mcqs: parseInt(mcqs) || 0,
      subjects: parseInt(subjects) || 0,
      created_at: new Date().toISOString(),
    });
    saveDb(db);
  },

  listModules(groupId) {
    const db = loadDb();
    return db.shared_modules
      .filter(m => m.group_id === groupId)
      .map(m => ({ ...m, shared_by_user: db.users.find(u => u.id === m.shared_by) }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /* ===== PROGRESS ===== */
  logProgress({ groupId, userId, mcqs, videos }) {
    const db = loadDb();
    db.progress_logs.push({
      id: uuid(), group_id: groupId, user_id: userId,
      mcqs: mcqs || 0, videos: videos || 0,
      logged_at: new Date().toISOString(),
    });
    saveDb(db);
  },

  weeklyProgress(groupId, userId) {
    const db = loadDb();
    const weekStart = startOfWeek().getTime();
    const logs = db.progress_logs.filter(l =>
      l.group_id === groupId && l.user_id === userId &&
      new Date(l.logged_at).getTime() >= weekStart
    );
    return {
      mcqs: logs.reduce((a, l) => a + (l.mcqs || 0), 0),
      videos: logs.reduce((a, l) => a + (l.videos || 0), 0),
    };
  },

  groupWeekStatus(groupId) {
    const db = loadDb();
    const members = db.memberships.filter(m => m.group_id === groupId);
    let onTrack = 0;
    members.forEach(m => {
      const prog = api.weeklyProgress(groupId, m.user_id);
      const mcqPct = m.mcq_goal ? prog.mcqs / m.mcq_goal : 0;
      const videoPct = m.video_goal ? prog.videos / m.video_goal : 0;
      const composite = (mcqPct + videoPct) / 2;
      if (composite >= 0.5) onTrack += 1;
    });
    return { total: members.length, onTrack, threshold: 3 };
  },

  /* ===== LIBRARY BADGES ===== */
  listBadges(groupId) {
    return loadDb().week_badges.filter(b => b.group_id === groupId);
  },

  unlockRandomBadge(groupId) {
    const db = loadDb();
    const earned = new Set(db.week_badges.filter(b => b.group_id === groupId).map(b => b.book_id));
    const available = TEXTBOOKS.filter(t => !earned.has(t.id));
    if (available.length === 0) return null;
    const weekStart = startOfWeek().toISOString().slice(0, 10);
    if (db.week_badges.some(b => b.group_id === groupId && b.week_start === weekStart)) return null;
    const pick = available[Math.floor(Math.random() * available.length)];
    const badge = {
      id: uuid(), group_id: groupId, week_start: weekStart,
      book_id: pick.id, earned_at: new Date().toISOString(),
    };
    db.week_badges.push(badge);
    saveDb(db);
    return badge;
  },

  /* ===== DEMO SEED ===== */
  seedDemoGroup(userId) {
    const db = loadDb();
    const demoUsers = [
      { name: 'Dr Rakesh',   organ: 'heart'   },
      { name: 'Dr Yasha',    organ: 'brain'   },
      { name: 'Dr Sidd',     organ: 'liver'   },
      { name: 'Dr Aditi',    organ: 'kidneys' },
    ];
    const userIds = demoUsers.map(d => {
      const id = uuid();
      db.users.push({
        id, email: `${d.name.split(' ')[1].toLowerCase()}@demo.com`,
        display_name: d.name, created_at: new Date().toISOString(),
      });
      return id;
    });
    const group = {
      id: uuid(),
      name: 'Surgery sprinters',
      description: 'Pushing through surgery and medicine together',
      default_mcq_goal: 200,
      default_video_goal: 8,
      invite_code: inviteCode(),
      created_by: userIds[0],
      created_at: new Date(Date.now() - 7 * 86400_000).toISOString(),
    };
    db.groups.push(group);
    // Memberships: demos with avatars, plus the real user (4 demos + 1 user = 5 total)
    demoUsers.forEach((d, i) => {
      db.memberships.push({
        id: uuid(), user_id: userIds[i], group_id: group.id,
        avatar_organ: d.organ, mcq_goal: 200, video_goal: 8,
        nudges_enabled: true, role: i === 0 ? 'admin' : 'member',
        joined_at: new Date(Date.now() - (7 - i) * 86400_000).toISOString(),
      });
    });
    db.memberships.push({
      id: uuid(), user_id: userId, group_id: group.id,
      avatar_organ: null, mcq_goal: 200, video_goal: 8,
      nudges_enabled: true, role: 'member',
      joined_at: new Date().toISOString(),
    });
    // Seed weekly progress for demo users
    const progress = [[180, 7], [140, 6], [80, 4], [50, 2]];
    demoUsers.forEach((d, i) => {
      db.progress_logs.push({
        id: uuid(), group_id: group.id, user_id: userIds[i],
        mcqs: progress[i][0], videos: progress[i][1],
        logged_at: new Date().toISOString(),
      });
    });
    // Seed some shared modules
    const moduleSamples = [
      { code: '8QDK043V', sharedBy: userIds[1], mcqs: 15, subjects: 5, daysAgo: 1 },
      { code: '8DSK043M', sharedBy: userIds[2], mcqs: 20, subjects: 6, daysAgo: 3 },
      { code: '90DK043L', sharedBy: userIds[3], mcqs: 25, subjects: 7, daysAgo: 5 },
      { code: '4QDK043K', sharedBy: userIds[0], mcqs: 35, subjects: 1, daysAgo: 8 },
    ];
    moduleSamples.forEach(m => {
      db.shared_modules.push({
        id: uuid(), group_id: group.id, shared_by: m.sharedBy,
        code: m.code, mcqs: m.mcqs, subjects: m.subjects,
        created_at: new Date(Date.now() - m.daysAgo * 86400_000).toISOString(),
      });
    });
    // Seed one active focus session (Rakesh studying)
    db.focus_sessions.push({
      id: uuid(), user_id: userIds[0], group_id: group.id,
      started_at: new Date(Date.now() - 12 * 60_000).toISOString(),
      duration_min: 50, paused_at: null, paused_total_ms: 0, ended_at: null,
    });
    saveDb(db);
    return group;
  },

  reset() { localStorage.removeItem(STORAGE_KEY); },
};
