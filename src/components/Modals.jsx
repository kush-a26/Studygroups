import React, { useState } from 'react';
import { ORGANS } from '../lib/catalog.js';

export function AvatarPickerModal({ onSave, onCancel }) {
  const [organ, setOrgan] = useState(null);
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Pick your character</h3>
        <p className="modal-subtitle">Who do you want to be at this table?</p>
        <div className="organ-grid">
          {ORGANS.map(o => (
            <button
              key={o.id}
              className={`organ-tile ${organ === o.id ? 'selected' : ''}`}
              onClick={() => setOrgan(o.id)}
              type="button"
            >
              <img src={o.img} alt={o.name} className="organ-tile-img" draggable={false} />
              <span className="organ-tile-label">{o.name}</span>
            </button>
          ))}
        </div>
        <div className="actions between" style={{ marginTop: 0 }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!organ} onClick={() => onSave(organ)}>Continue</button>
        </div>
      </div>
    </div>
  );
}

export function TimerPickerModal({ onStart, onCancel }) {
  const [duration, setDuration] = useState(50);
  const [custom, setCustom] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const presets = [25, 50, 90, null];
  const onSubmit = () => {
    const final = isCustom ? parseInt(custom) : duration;
    if (!final || final < 5 || final > 240) return;
    onStart(final);
  };
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>How long?</h3>
        <p className="modal-subtitle">Pick a focused block. You can pause or end it any time.</p>
        <div className="duration-grid">
          {presets.map(p => p === null ? (
            <button key="custom" type="button"
              className={`duration-btn ${isCustom ? 'selected' : ''}`}
              onClick={() => setIsCustom(true)}>
              <div className="duration-num">Custom</div>
              <div className="duration-unit">5 to 240 min</div>
            </button>
          ) : (
            <button key={p} type="button"
              className={`duration-btn ${!isCustom && duration === p ? 'selected' : ''}`}
              onClick={() => { setDuration(p); setIsCustom(false); }}>
              <div className="duration-num">{p}</div>
              <div className="duration-unit">min</div>
            </button>
          ))}
        </div>
        {isCustom && (
          <div style={{ marginBottom: 16 }}>
            <input type="number" min="5" max="240" autoFocus
              className="field-input"
              placeholder="Minutes"
              value={custom}
              onChange={e => setCustom(e.target.value)} />
          </div>
        )}
        <div className="actions between" style={{ marginTop: 0 }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onSubmit}>Start focusing</button>
        </div>
      </div>
    </div>
  );
}

export function GoalEditModal({ currentMcq, currentVideo, onSave, onCancel }) {
  const [mcq, setMcq] = useState(currentMcq);
  const [video, setVideo] = useState(currentVideo);
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Set your weekly goals</h3>
        <p className="modal-subtitle">These are personal targets. The group's combined progress unlocks the weekly textbook badge.</p>
        <div className="field-pair">
          <div className="field-row">
            <label className="field-label">MCQs per week</label>
            <input type="number" min="1" className="field-input" value={mcq} onChange={e => setMcq(e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Videos per week</label>
            <input type="number" min="1" className="field-input" value={video} onChange={e => setVideo(e.target.value)} />
          </div>
        </div>
        <div className="actions between" style={{ marginTop: 'var(--space-3)' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ mcq: parseInt(mcq), video: parseInt(video) })}>Save goals</button>
        </div>
      </div>
    </div>
  );
}

export function ModuleSolveModal({ module, onClose }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(module.code); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  const u = module.shared_by_user;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Solve this module</h3>
        <p className="modal-subtitle">
          Shared by <strong style={{ color: 'var(--color-primary-50)' }}>{u ? u.display_name : 'Someone'}</strong>
          {module.mcqs > 0 && <> · {module.mcqs} MCQs</>}
          {module.subjects > 0 && <> · {module.subjects} Subjects</>}
        </p>
        <div style={{
          textAlign: 'center',
          background: 'var(--color-n-10)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
        }}>
          <div style={{
            font: 'var(--font-heading-2)',
            fontFamily: 'monospace',
            fontWeight: 500,
            letterSpacing: 3,
            marginBottom: 12,
            color: 'var(--color-on-surface)',
          }}>{module.code}</div>
          <button className="btn btn-secondary btn-sm" onClick={onCopy}>
            {copied ? 'Copied ✓' : 'Copy code'}
          </button>
        </div>
        <p style={{
          font: 'var(--font-body-small)',
          color: 'var(--color-on-surface-varient)',
          textAlign: 'center',
          marginBottom: 'var(--space-4)',
        }}>
          This module lives in Marrow. Copy the code, then open Marrow to solve it.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a className="btn btn-primary btn-block" href="https://www.marrow.com" target="_blank" rel="noopener">Open Marrow web</a>
          <a className="btn btn-secondary btn-block" href="#" onClick={e => { e.preventDefault(); alert('Deep link to Marrow app — stubbed in prototype'); }}>Open Marrow app</a>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
