import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftPanelButton from '../components/LeftPanelButton';
import { getCurrentUser, getSubjects } from '../utils/auth';
import PreferencePage from './PreferencePage';
import AllottedPage from './AllottedPage';
import AboutPanel from './AboutPanel';

export default function StudentDashboard(){
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [active, setActive] = useState('preference');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'student') {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(()=>{
    // Load subjects initially
    const s = getSubjects();
    if(s) setSubjects(s);

    // Listen for custom event when subjects are updated
    const handleSubjectsUpdate = (e) => {
      setSubjects(e.detail);
    };

    // Listen for storage events from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'ssaems_subjects') {
        const updatedSubjects = getSubjects();
        if(updatedSubjects) setSubjects(updatedSubjects);
      }
    };

    window.addEventListener('subjectsUpdated', handleSubjectsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('subjectsUpdated', handleSubjectsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  },[]);

  return (
    <div>
      <div style={{
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '1rem',
      }}>
        <h2 style={{ margin: 0 }}>Student Dashboard</h2>
      </div>

      <div className="container dashboard" style={{ display: 'flex', gap: 16, padding: 16 }}>
        <aside className="leftcol" style={{ width: 320, flexShrink: 0 }}>
          <div className="profile card" style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <h3 style={{ marginTop: 0 }}>{user?.name || user?.idNumber}</h3>
            <p><strong>ID:</strong> {user?.idNumber}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>CGPA:</strong> {user?.cgpa || 'N/A'}</p>
          </div>

          <LeftPanelButton
            title="Elective Preference"
            desc="Submit ranked elective choices"
            active={active==='preference'}
            onClick={()=>setActive('preference')}
          />
          <LeftPanelButton
            title="Allotted Electives"
            desc="View your allotted course and change request"
            active={active==='allotted'}
            onClick={()=>setActive('allotted')}
          />
          <LeftPanelButton
            title="About"
            desc="Course details and credits"
            active={active==='about'}
            onClick={()=>setActive('about')}
          />
        </aside>

        <section className="maincol" style={{ flex: 1, minWidth: 0 }}>
          {active === 'preference' && (
            <PreferencePage subjects={subjects} user={user} onSubmitted={()=>setActive('allotted')} />
          )}
          {active === 'allotted' && (
            <AllottedPage user={user} subjects={subjects} />
          )}
          {active === 'about' && (
            <AboutPanel subjects={subjects} />
          )}
        </section>
      </div>
    </div>
  );
}