import React, { useState } from 'react';

function formatRelative(iso) {
  const d = new Date(iso);
  const day = d.toLocaleString('en', { day: 'numeric' });
  const month = d.toLocaleString('en', { month: 'short' });
  return `${day} ${month}`;
}

export function ModulesList({ modules, onShare, onSolve }) {
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [mcqs, setMcqs] = useState('');
  const [subjects, setSubjects] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onShare({
      code: code.trim().toUpperCase(),
      mcqs: parseInt(mcqs) || 0,
      subjects: parseInt(subjects) || 0,
    });
    setCode(''); setMcqs(''); setSubjects('');
    setShowForm(false);
  };

  return (
    <div className="modules-card">
      <h3 className="modules-card-title">Custom modules</h3>

      {showForm ? (
        <form className="modules-share-form" onSubmit={onSubmit}>
          <input
            className="field-input"
            placeholder="Module code (e.g. 4QDK039R)"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            autoFocus
            style={{ fontFamily: 'monospace', letterSpacing: 0.5 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input className="field-input" type="number" min="0" placeholder="MCQs" value={mcqs} onChange={e => setMcqs(e.target.value)} />
            <input className="field-input" type="number" min="0" placeholder="Subjects" value={subjects} onChange={e => setSubjects(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={!code.trim()}>Share</button>
          </div>
        </form>
      ) : (
        <button
          className="btn btn-secondary btn-sm btn-block"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: 16 }}
        >
          + Share a module
        </button>
      )}

      {modules.length === 0 && !showForm ? (
        <p className="modules-empty">No modules shared yet.<br/>Be the first.</p>
      ) : (
        modules.map((m, i) => {
          const u = m.shared_by_user;
          return (
            <button key={m.id} className="module-row module-row-cta" onClick={() => onSolve(m)}>
              <span className="module-row-index">{i + 1}</span>
              <div>
                <div className="module-row-code">{m.code}</div>
                <div className="module-row-sub">
                  <strong>{u ? u.display_name : 'Someone'}</strong>
                  {m.mcqs > 0 && <> · {m.mcqs} MCQs</>}
                  {m.subjects > 0 && <> · {m.subjects} Subjects</>}
                  {' · '}{formatRelative(m.created_at)}
                </div>
              </div>
              <svg className="module-row-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          );
        })
      )}
    </div>
  );
}
