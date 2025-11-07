import React from 'react';

export default function LeftPanelButton({ title, desc, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        border: active ? '2px solid #1976d2' : '1px solid #e0e0e0',
        background: active ? 'rgba(25,118,210,0.06)' : '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        cursor: 'pointer'
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ color: '#666', fontSize: 13 }}>{desc}</div>
    </button>
  );
}
