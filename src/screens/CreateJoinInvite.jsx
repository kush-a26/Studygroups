import React, { useState, useEffect } from 'react';
import { api } from '../lib/db.js';
import { useAuth, useRoute, useToast, navigate } from '../lib/context.jsx';
import { TopBar } from '../components/TopBar.jsx';

export function Create() {
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mcqGoal, setMcqGoal] = useState(200);
  const [videoGoal, setVideoGoal] = useState(8);
  const [errors, setErrors] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Give the group a name';
    else if (name.trim().length > 40) errs.name = 'Keep it under 40 characters';
    if (!description.trim()) errs.description = 'Add a short description';
    else if (description.trim().length > 120) errs.description = 'Keep it under 120 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const g = api.createGroup({
      name, description,
      mcqGoal: parseInt(mcqGoal),
      videoGoal: parseInt(videoGoal),
      userId: user.id,
    });
    toast('Group created');
    navigate(`/invite/${g.id}`);
  };

  return (
    <div className="app-shell">
      <TopBar showBack backTo="/" />
      <div className="center-page">
        <div className="center-stack">
          <div className="card">
            <h1 className="card-title">Create a group</h1>
            <div className="card-divider"></div>
            <p className="card-subtitle">Set a name and a default weekly goal. You can adjust later.</p>
            <form onSubmit={onSubmit}>
              <div className="field-row">
                <label className="field-label">Group name</label>
                <input autoFocus className={`field-input ${errors.name ? 'has-error' : ''}`}
                  placeholder="INICET Circle" value={name}
                  onChange={e => { setName(e.target.value); setErrors({}); }} />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
              <div className="field-row">
                <label className="field-label">Description</label>
                <input className={`field-input ${errors.description ? 'has-error' : ''}`}
                  placeholder="Pushing through anatomy together" value={description}
                  onChange={e => { setDescription(e.target.value); setErrors({}); }} />
                {errors.description && <div className="field-error">{errors.description}</div>}
              </div>
              <div className="field-pair">
                <div className="field-row">
                  <label className="field-label">MCQs per week</label>
                  <input type="number" min="1" className="field-input"
                    value={mcqGoal} onChange={e => setMcqGoal(e.target.value)} />
                </div>
                <div className="field-row">
                  <label className="field-label">Videos per week</label>
                  <input type="number" min="1" className="field-input"
                    value={videoGoal} onChange={e => setVideoGoal(e.target.value)} />
                </div>
              </div>
              <div className="actions between">
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!name.trim() || !description.trim()}>
                  Create group
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Join() {
  const { user } = useAuth();
  const { query } = useRoute();
  const toast = useToast();
  const [code, setCode] = useState(query.code || '');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Enter a code or invite link'); return; }
    let parsed = code.trim();
    const m = parsed.match(/(MARROW-[A-Z0-9]+)/i);
    if (m) parsed = m[1];
    const result = api.joinGroup({ code: parsed, userId: user.id });
    if (result.error) { setError(result.error); return; }
    toast(`Joined ${result.group.name}`);
    navigate(`/group/${result.group.id}`);
  };

  return (
    <div className="app-shell">
      <TopBar showBack backTo="/" />
      <div className="center-page">
        <div className="center-stack">
          <div className="card">
            <h1 className="card-title">Join a group</h1>
            <div className="card-divider"></div>
            <p className="card-subtitle">Paste an invite link or enter the code.</p>
            <form onSubmit={onSubmit}>
              <div className="field-row">
                <label className="field-label">Invite link / code</label>
                <input autoFocus className={`field-input ${error ? 'has-error' : ''}`}
                  placeholder="MARROW-XXXXX" value={code}
                  onChange={e => { setCode(e.target.value); setError(''); }} />
                {error && <div className="field-error">{error}</div>}
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={!code.trim()} style={{ marginTop: 24 }}>
                Join group
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Invite() {
  const { user } = useAuth();
  const { path } = useRoute();
  const toast = useToast();
  const groupId = path.split('/').pop();
  const [group, setGroup] = useState(null);
  const [emails, setEmails] = useState([]);
  const [pending, setPending] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setGroup(api.getGroup(groupId)); }, [groupId]);
  if (!group) return null;

  const MAX = 4;
  const link = `${window.location.origin}${window.location.pathname}#/join?code=${group.invite_code}`;

  const onAdd = () => {
    const t = pending.trim().toLowerCase();
    if (!t) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) { setError('Not a valid email'); return; }
    if (emails.includes(t)) { setError('Already added'); return; }
    if (emails.length >= MAX) { setError(`Up to ${MAX} other members`); return; }
    setEmails([...emails, t]); setPending(''); setError('');
  };

  const onCopy = async () => {
    try { await navigator.clipboard.writeText(link); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  const onContinue = () => {
    if (emails.length) {
      api.inviteByEmail({ groupId, emails, fromUserId: user.id });
      toast(`Invites queued · ${emails.length}`);
    }
    navigate(`/group/${group.id}`);
  };

  return (
    <div className="app-shell">
      <TopBar showBack backTo="/" />
      <div className="center-page">
        <div className="center-stack">
          <div className="card">
            <h1 className="card-title">Invite friends</h1>
            <div className="card-divider"></div>
            <p className="card-subtitle">Share an invite link or add up to {MAX} other members.</p>
            <div className="invite-link-row">
              <span className="invite-link-text">{`marrow.app/join ${group.invite_code}`}</span>
              <button className={`invite-link-copy ${copied ? 'copied' : ''}`} onClick={onCopy}>
                {copied ? 'Copied ✓' : 'Copy link'}
              </button>
            </div>
            <div className="or-divider">Or</div>
            <div className="field-row">
              <label className="field-label">Add by email</label>
              <div className="email-input-row">
                <input className={`field-input ${error ? 'has-error' : ''}`}
                  placeholder="Enter email" value={pending}
                  onChange={e => { setPending(e.target.value); setError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }} />
                <button type="button" className="btn btn-primary btn-sm" onClick={onAdd} disabled={!pending.trim() || emails.length >= MAX}>
                  Add +
                </button>
              </div>
              {error && <div className="field-error">{error}</div>}
            </div>
            {emails.length > 0 && (
              <>
                <div className="email-chips">
                  {emails.map(e => (
                    <span key={e} className="chip">{e}
                      <button className="chip-remove" onClick={() => setEmails(emails.filter(x => x !== e))} aria-label={`Remove ${e}`}>×</button>
                    </span>
                  ))}
                </div>
                <div className="chip-counter">{emails.length}/{MAX} added</div>
              </>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
              <button className="btn btn-primary btn-block" onClick={onContinue}>Continue</button>
              <button className="btn btn-ghost" onClick={() => navigate(`/group/${group.id}`)}>Skip for now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
