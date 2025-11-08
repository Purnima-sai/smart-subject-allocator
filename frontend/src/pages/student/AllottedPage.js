import React, { useMemo, useState } from 'react';
import { getPreferences, saveChangeRequest } from '../utils/auth';

export default function AllottedPage({ user, subjects = [] }) {
  const prefs = useMemo(() => getPreferences() || [], []);
  const [wantsChange, setWantsChange] = useState('no');
  const [reason, setReason] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Simulated allocation: try to read from localStorage key 'ssaems_allocated_course_id'
  const allocatedId = useMemo(() => localStorage.getItem('ssaems_allocated_course_id') || null, []);
  const list = useMemo(() => (subjects && subjects.length ? subjects : []), [subjects]);
  const allocated = useMemo(() => list.find((s) => s.id === allocatedId) || null, [list, allocatedId]);

  const onSubmit = () => {
    setError('');
    setSuccess('');
    if (wantsChange === 'yes' && (!reason.trim() || !newCourse)) {
      setError('Please provide a reason and select a preferred course.');
      return;
    }
    saveChangeRequest({ wantsChange, reason, newCourse, userId: user?.idNumber });
    setSuccess('Your response has been recorded.');
    setReason('');
    setNewCourse('');
    setWantsChange('no');
  };

  return (
    <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Allotted Elective</h3>
      {error && (
        <div style={{ background: '#ffebee', color: '#b71c1c', border: '1px solid #ffcdd2', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#e8f5e9', color: '#1b5e20', border: '1px solid #c8e6c9', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          {success}
        </div>
      )}

      {!allocated && prefs.length > 0 && (
        <>
          <div style={{ background: '#f5f7fb', border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            Awaiting allocation from Admin. Your submitted preferences are below.
          </div>
          <ol style={{ paddingLeft: 18 }}>
            {prefs.map((p) => (
              <li key={`${p.id}-${p.priority}`} style={{ marginBottom: 6 }}>
                <strong>{p.priority}</strong>. {list.find((s) => s.id === p.id)?.name || p.id}
              </li>
            ))}
          </ol>
        </>
      )}

      {allocated && (
        <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>{allocated.name}</div>
          <div style={{ color: '#666' }}>{allocated.id}</div>
          {(allocated.year || allocated.semester) && (
            <div style={{ color: '#1976d2', fontSize: 14, marginTop: 4 }}>
              {allocated.year && `Year ${allocated.year}`}{allocated.year && allocated.semester && ' • '}{allocated.semester && `Semester ${allocated.semester}`}
            </div>
          )}
          <div style={{ marginTop: 6 }}><strong>Faculty:</strong> {allocated.faculty || 'TBA'}</div>
          <div><strong>Hours/Week:</strong> 3</div>
          <div><strong>Schedule:</strong> {allocated.schedule || 'TBA'}</div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Do you want to change your elective course?</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <label><input type="radio" name="change" value="yes" checked={wantsChange==='yes'} onChange={(e)=>setWantsChange(e.target.value)} /> Yes</label>
          <label><input type="radio" name="change" value="no" checked={wantsChange==='no'} onChange={(e)=>setWantsChange(e.target.value)} /> No</label>
        </div>

        {wantsChange === 'yes' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#444' }}>Reason</label>
              <textarea rows={4} value={reason} onChange={(e)=>setReason(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e0e0e0' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#444' }}>Preferred Course</label>
              <select value={newCourse} onChange={(e)=>setNewCourse(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e0e0e0' }}>
                <option value="">Select a course</option>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <button onClick={onSubmit} style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
