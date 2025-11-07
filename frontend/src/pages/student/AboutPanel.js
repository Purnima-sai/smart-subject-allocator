import React, { useMemo } from 'react';

export default function AboutPanel({ subjects = [] }) {
  const allocatedId = useMemo(() => localStorage.getItem('ssaems_allocated_course_id') || null, []);
  const list = subjects && subjects.length ? subjects : [];
  const allocated = list.find((s) => s.id === allocatedId) || list[0] || null;

  return (
    <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>About the Allotted Course</h3>
      {!allocated && (
        <div style={{ color: '#666' }}>No course details available yet.</div>
      )}
      {allocated && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{allocated.name}</div>
            <div style={{ color: '#666' }}>{allocated.id}</div>
            <p style={{ marginTop: 8 }}>{allocated.description || 'Description not available.'}</p>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>Faculty:</strong> {allocated.faculty || 'TBA'}</li>
              <li><strong>Credits:</strong> {allocated.credits || 3}</li>
              <li><strong>Teaching Hours/Week:</strong> {allocated.hours || 3}</li>
              <li><strong>Year:</strong> {allocated.year ? `${allocated.year}${allocated.year === '1' ? 'st' : allocated.year === '2' ? 'nd' : allocated.year === '3' ? 'rd' : 'th'} Year` : 'Not specified'}</li>
              <li><strong>Semester:</strong> {allocated.semester ? `Semester ${allocated.semester}` : 'Not specified'}</li>
              <li><strong>Assessment:</strong> Midterm (30), Project (20), Final (50)</li>
              <li><strong>Topics:</strong> Overview, Core Concepts, Case Studies, Applications</li>
            </ul>
          </div>
          <div>
            <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Course Snapshot</div>
              <div><strong>Schedule:</strong> {allocated.schedule || 'TBA'}</div>
              <div><strong>Resources:</strong> Syllabus, Slides, References</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
