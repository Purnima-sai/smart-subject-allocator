import React, { useMemo, useState } from 'react';
import { saveSubjects } from '../utils/auth';

export default function PreferencePage({ subjects = [], user, onSubmitted }) {
  const [prefs, setPrefs] = useState(() => {
    // initialize from saved preferences if any
    try {
      const raw = localStorage.getItem('ssaems_prefs');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {};
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const list = useMemo(() => {
    // If no subjects provided, seed with defaults
    if (!subjects || subjects.length === 0) {
      const seed = [
        { id: 'CS501', name: 'Advanced Machine Learning', desc: 'Deep learning, RL, CNNs, RNNs' },
        { id: 'CS502', name: 'Cloud Computing', desc: 'Virtualization, containers, serverless' },
        { id: 'CS503', name: 'Blockchain Technology', desc: 'Cryptography, ledgers, smart contracts' },
        { id: 'CS504', name: 'Data Visualization', desc: 'D3, dashboards, design best practices' },
        { id: 'CS505', name: 'Cybersecurity Basics', desc: 'Threats, vulns, defenses' },
        { id: 'CS506', name: 'NLP Fundamentals', desc: 'Tokenization, LMs, transformers' },
        { id: 'CS507', name: 'IoT Systems', desc: 'Edge nodes, protocols, gateways' },
        { id: 'CS508', name: 'Big Data Analytics', desc: 'Hadoop/Spark, ETL, pipelines' },
        { id: 'CS509', name: 'Computer Vision', desc: 'Image processing, detection' },
        { id: 'CS510', name: 'Edge Computing', desc: 'Distributed compute near data sources' },
      ];
      // persist seed so other pages can see them
      saveSubjects(seed);
      return seed;
    }
    return subjects;
  }, [subjects]);

  const setPriority = (id, v) => {
    const num = Number(v);
    const next = { ...prefs, [id]: isNaN(num) ? '' : num };
    setPrefs(next);
    // validations
    const values = Object.values(next).filter((x) => x !== '' && !isNaN(x));
    const unique = new Set(values);
    if (values.some((n) => n < 1 || n > 10)) setError('Priorities must be in 1..10');
    else if (unique.size !== values.length) setError('Each priority must be unique');
    else setError('');
  };

  const onSubmit = () => {
    if (error) return;
    const selected = Object.entries(prefs)
      .filter(([_, v]) => v && !isNaN(v))
      .map(([id, priority]) => ({ id, priority: Number(priority) }))
      .sort((a, b) => a.priority - b.priority);
    if (selected.length === 0) {
      setError('Please choose at least one preference');
      return;
    }
    try {
      const raw = localStorage.getItem('ssaems_prefs');
      const obj = raw ? JSON.parse(raw) : {};
      const map = (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
      if (user && user.idNumber) {
        map[user.idNumber] = selected;
        localStorage.setItem('ssaems_prefs', JSON.stringify(map));
      } else {
        // fallback: store as last-submitted if no user id is available
        localStorage.setItem('ssaems_prefs', JSON.stringify({ __last__: selected }));
      }
    } catch (_) {}
    setSuccess('Preferences submitted successfully!');
    if (typeof onSubmitted === 'function') onSubmitted();
  };

  return (
    <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Elective Preference</h3>
      <p style={{ color: '#666', marginTop: -8 }}>Assign a unique priority (1-10) for each course you want.</p>
      {error && <div style={{ color: '#b00020', marginBottom: 8 }}>{error}</div>}
      {success && (
        <div style={{ background: '#e8f5e9', color: '#1b5e20', border: '1px solid #c8e6c9', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {list.map((s) => (
          <div key={s.id} className="card" style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: '#666', fontSize: 13 }}>{s.id}</div>
                {(s.year || s.semester) && (
                  <div style={{ color: '#1976d2', fontSize: 12, marginTop: 4 }}>
                    {s.year && `Year ${s.year}`}{s.year && s.semester && ' • '}{s.semester && `Sem ${s.semester}`}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => alert(`${s.name}\n\n${s.desc}`)}
                style={{ border: '1px solid #e0e0e0', background: '#fff', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
              >
                Description
              </button>
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 13, color: '#444' }}>Priority</label>
              <input
                type="number"
                min={1}
                max={10}
                value={prefs[s.id] ?? ''}
                onChange={(e) => setPriority(s.id, e.target.value)}
                style={{ width: 120, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <button onClick={onSubmit} style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}>
          Submit Preferences
        </button>
      </div>
    </div>
  );
}
