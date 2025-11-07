import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType') || 'Student';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid #e0e0e0', background: '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1976d2' }} />
        <h2 style={{ margin: 0, fontSize: 18 }}>SSAEMS - {userType}</h2>
      </div>
      <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a href="/" style={{ textDecoration: 'none', color: '#1976d2' }}>Home</a>
        <a href="/features" style={{ textDecoration: 'none', color: '#1976d2' }}>Features</a>
        <a href="/contact" style={{ textDecoration: 'none', color: '#1976d2' }}>Help</a>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
