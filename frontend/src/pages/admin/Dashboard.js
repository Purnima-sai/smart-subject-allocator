import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard(){
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({labels:[],data:[]});
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '2rem'
  };
  
  const [newSubject, setNewSubject] = useState({name:'', credits:3, hours:3, capacity:30, faculty:'', description:'', topics:'', year:'', semester:''});
  const [editingSubject, setEditingSubject] = useState(null);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [allocationHistory, setAllocationHistory] = useState([]);
  const [systemSettings, setSystemSettings] = useState({
    maxPreferences: 5,
    allocationLocked: false,
    registrationOpen: true,
    semester: 'Fall 2025'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  // Stylish button presets
  const btnStyle = {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 14px',
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
    cursor: 'pointer'
  };
  const btnOutlineStyle = {
    background: '#fff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer'
  };

  useEffect(()=>{
    // Load subjects from backend instead of localStorage
    const loadSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/admin/subjects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          const mapped = (data.subjects || []).map(s => ({
            id: s._id,
            code: s.code,
            name: s.title,
            capacity: s.capacity,
            faculty: s.instructor?.name || '',
            year: String(s.year),
            semester: String(s.semester),
            credits: s.credits || 3,
            hours: s.hours || 3,
            description: s.description || '',
            topics: s.topics || [],
          }));
          setSubjects(mapped);
          computeStats(mapped);
        } else {
          setSubjects([]);
        }
      } catch (e) {
        console.error('Failed to load subjects', e);
        setSubjects([]);
      } finally {
        loadAllocationHistory();
        loadSystemSettings();
        fetchRegisteredElectives(); // Load registered students on mount
      }
    };
    loadSubjects();
  },[]);

  function loadAllocationHistory() {
    const history = JSON.parse(localStorage.getItem('ssaems_allocation_history') || '[]');
    setAllocationHistory(history);
  }

  function loadSystemSettings() {
    const settings = JSON.parse(localStorage.getItem('ssaems_system_settings') || 'null');
    if (settings) setSystemSettings(settings);
  }

  function saveSystemSettings() {
    localStorage.setItem('ssaems_system_settings', JSON.stringify(systemSettings));
    alert('System settings saved successfully!');
  }

  function computeStats(s){
    const alls = JSON.parse(localStorage.getItem('ssaems_allotments')||'{}');
    const counts = {};
    Object.values(alls).forEach(a=>{ if(a && a.id) counts[a.id] = (counts[a.id]||0) + 1});
    const labels = s.map(x=>x.name);
    const data = s.map(x=>counts[x.id]||0);
    setStats({labels,data});
  }

  function runAllocation(){
    if (systemSettings.allocationLocked) {
      alert('Allocation is locked! Unlock in settings to run allocation.');
      return;
    }
    // Show upload dialog instead of running directly
    setShowUploadDialog(true);
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/)) {
        alert('Please upload a valid CSV or Excel file');
        return;
      }
      setUploadedFile(file);
    }
  }

  function processAllocationFile() {
    if (!uploadedFile) {
      alert('Please select a file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse CSV (expected format: studentId, name, email, cgpa, preferences)
        const headers = lines[0].split(',').map(h => h.trim());
        const studentsData = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 4) {
            studentsData.push({
              idNumber: values[0],
              name: values[1],
              email: values[2],
              cgpa: parseFloat(values[3]) || 0,
              role: 'student'
            });
          }
        }

        // Store students
        localStorage.setItem('ssaems_users', JSON.stringify(studentsData));
        
        // Run allocation algorithm
        executeAllocation();
        setShowUploadDialog(false);
        setUploadedFile(null);
      } catch (error) {
        alert('Error processing file: ' + error.message);
      }
    };
    reader.readAsText(uploadedFile);
  }

  function executeAllocation() {
    const users = JSON.parse(localStorage.getItem('ssaems_users')||'[]').filter(u=>u.role==='student');
    const prefs = JSON.parse(localStorage.getItem('ssaems_prefs')||'{}');
  const subjList = subjects;
    const cap = {};
    subjList.forEach(s=> cap[s.id] = s.capacity || 30);
    users.sort((a,b)=> (parseFloat(b.cgpa||0) - parseFloat(a.cgpa||0)));
    const allotments = {};
    const unallocated = [];
    users.forEach(u=>{
      const p = prefs[u.idNumber] || [];
      let allocated = false;
      for(const choice of p){
        if(cap[choice.id] > 0){
          const subj = subjList.find(s=>s.id===choice.id);
          allotments[u.idNumber] = { id: subj.id, name: subj.name, faculty: subj.faculty, hours: subj.hours, credits: subj.credits };
          cap[choice.id] -= 1;
          allocated = true;
          break;
        }
      }
      if (!allocated) unallocated.push(u.idNumber);
    });
    localStorage.setItem('ssaems_allotments', JSON.stringify(allotments));
    const history = JSON.parse(localStorage.getItem('ssaems_allocation_history') || '[]');
    history.push({
      date: new Date().toISOString(),
      totalStudents: users.length,
      allocated: Object.keys(allotments).length,
      unallocated: unallocated.length,
      allocatedPercentage: ((Object.keys(allotments).length / users.length) * 100).toFixed(1)
    });
    localStorage.setItem('ssaems_allocation_history', JSON.stringify(history));
    alert(`Allocation completed! ${Object.keys(allotments).length}/${users.length} students allocated. ${unallocated.length} unallocated.`);
    computeStats(subjList);
    loadAllocationHistory();
  }

  function exportCSV(){
    const alls = JSON.parse(localStorage.getItem('ssaems_allotments')||'{}');
    const users = JSON.parse(localStorage.getItem('ssaems_users')||'[]');
    let csv = 'id_number,name,email,cgpa,allotted_subject,faculty\n';
    users.filter(u=>u.role==='student').forEach(u=>{
      const a = alls[u.idNumber];
      csv += `${u.idNumber},${u.name||''},${u.email||''},${u.cgpa||''},${a?.name||''},${a?.faculty||''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'allotments.csv'; a.click();
  }

  async function addSubject() {
    if (!newSubject.name.trim()) return alert('Subject name is required');
    if (!newSubject.year) return alert('Year is required');
    if (!newSubject.semester) return alert('Semester is required');
    try {
      const token = localStorage.getItem('token');
      console.log('Admin token for subject creation:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }
      // Generate a simple code if not provided
      const code = (newSubject.name || 'SUBJ').toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 12) + '_' + Math.random().toString(36).slice(-4).toUpperCase();
      const body = {
        code,
        title: newSubject.name,
        capacity: Number(newSubject.capacity) || 30,
        year: Number(newSubject.year),
        semester: Number(newSubject.semester),
        credits: Number(newSubject.credits) || 3,
        hours: Number(newSubject.hours) || 3,
        description: newSubject.description || '',
        topics: (newSubject.topics || '').split(',').map(t => t.trim()).filter(Boolean),
        faculty: newSubject.faculty || '',
      };
      const resp = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create subject');
      }
      const data = await resp.json();
      const s = data.subject;
      const mapped = {
        id: s._id,
        code: s.code || code,
        name: s.title,
        capacity: s.capacity,
        faculty: s.instructor?.name || '',
        year: String(s.year),
        semester: String(s.semester),
        credits: newSubject.credits,
        hours: newSubject.hours,
        description: newSubject.description,
        topics: (newSubject.topics || '').split(',').map(t => t.trim()).filter(Boolean),
      };
      const updated = [...subjects, mapped];
      setSubjects(updated);
      computeStats(updated);
      setNewSubject({name:'', credits:3, hours:3, capacity:30, faculty:'', description:'', topics:'', year:'', semester:''});
      alert('Subject added successfully!');
      // signal other tabs/windows (students) to refresh
      try { localStorage.setItem('ssaems_subjects_dirty', String(Date.now())); } catch (_) {}
    } catch (e) {
      alert(e.message);
    }
  }

  function editSubject(subject) {
    setEditingSubject({
      ...subject,
      topics: Array.isArray(subject.topics) ? subject.topics.join(', ') : (subject.topics || '')
    });
  }

  async function updateSubject() {
    if (!editingSubject.year) return alert('Year is required');
    if (!editingSubject.semester) return alert('Semester is required');
    try {
      const token = localStorage.getItem('token');
      const body = {
        title: editingSubject.name,
        capacity: Number(editingSubject.capacity) || 30,
        year: Number(editingSubject.year),
        semester: Number(editingSubject.semester),
        credits: Number(editingSubject.credits) || 3,
        hours: Number(editingSubject.hours) || 3,
        description: editingSubject.description || '',
        topics: typeof editingSubject.topics === 'string' 
          ? editingSubject.topics.split(',').map(t => t.trim()).filter(Boolean)
          : editingSubject.topics || [],
        faculty: editingSubject.faculty || '',
      };
      const resp = await fetch(`/api/admin/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update subject');
      }
      const data = await resp.json();
      const s = data.subject;
      const mapped = {
        id: s._id,
        name: s.title,
        code: s.code,
        capacity: s.capacity,
        faculty: s.instructor?.name || s.faculty || '',
        year: String(s.year),
        semester: String(s.semester),
        credits: s.credits || 3,
        hours: s.hours || 3,
        description: s.description || '',
        topics: Array.isArray(s.topics) ? s.topics : [],
      };
      const updated = subjects.map(x => x.id === mapped.id ? mapped : x);
      setSubjects(updated);
      computeStats(updated);
      setEditingSubject(null);
      alert('Subject updated successfully!');
      try { localStorage.setItem('ssaems_subjects_dirty', String(Date.now())); } catch (_) {}
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteSubject(id) {
    const userConfirmed = window.confirm('Are you sure you want to delete this subject?');
    if (!userConfirmed) return;
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`/api/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete subject');
      }
      const updated = subjects.filter(s => s.id !== id);
      setSubjects(updated);
      computeStats(updated);
      alert('Subject deleted successfully!');
      try { localStorage.setItem('ssaems_subjects_dirty', String(Date.now())); } catch (_) {}
    } catch (e) {
      alert(e.message);
    }
  }

  function clearAllAllocations() {
    const userConfirmed = window.confirm('Are you sure you want to clear ALL allocations? This cannot be undone.');
    if (!userConfirmed) return;
    localStorage.removeItem('ssaems_allotments');
    localStorage.removeItem('ssaems_requests');
    alert('All allocations and requests cleared!');
    computeStats(subjects);
  }

  function generateReports() {
    const users = JSON.parse(localStorage.getItem('ssaems_users')||'[]');
    const prefs = JSON.parse(localStorage.getItem('ssaems_prefs')||'{}');
    const alls = JSON.parse(localStorage.getItem('ssaems_allotments')||'{}');
    const requests = JSON.parse(localStorage.getItem('ssaems_requests')||'[]');
    const students = users.filter(u => u.role === 'student');
    const faculty = users.filter(u => u.role === 'faculty');
    const report = {
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalSubjects: subjects.length,
      studentsWithPreferences: Object.keys(prefs).length,
      allocatedStudents: Object.keys(alls).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      deniedRequests: requests.filter(r => r.status === 'denied').length,
      allocationRate: ((Object.keys(alls).length / students.length) * 100).toFixed(1) + '%'
    };
    alert(
      'System Report:\n' +
      `Total Students: ${report.totalStudents}\n` +
      `Total Faculty: ${report.totalFaculty}\n` +
      `Total Subjects: ${report.totalSubjects}\n` +
      `Students with Preferences: ${report.studentsWithPreferences}\n` +
      `Allocated Students: ${report.allocatedStudents}\n` +
      `Allocation Rate: ${report.allocationRate}\n` +
      `Pending Requests: ${report.pendingRequests}\n` +
      `Approved Requests: ${report.approvedRequests}\n` +
      `Denied Requests: ${report.deniedRequests}`
    );
  }

  function handleRequest(requestId, action, adminNote = '') {
    const requests = JSON.parse(localStorage.getItem('ssaems_requests')||'[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) return alert('Request not found');
    const request = requests[requestIndex];
    requests[requestIndex] = {
      ...request,
      status: action,
      adminNote,
      resolvedBy: 'Admin',
      resolvedAt: new Date().toISOString()
    };
    localStorage.setItem('ssaems_requests', JSON.stringify(requests));
    if (action === 'approved') {
      const allotments = JSON.parse(localStorage.getItem('ssaems_allotments')||'{}');
      const requestedSubject = subjects.find(s => s.id === request.requested);
      if (requestedSubject) {
        allotments[request.student] = {
          id: requestedSubject.id,
          name: requestedSubject.name,
          faculty: requestedSubject.faculty,
          hours: requestedSubject.hours,
          credits: requestedSubject.credits
        };
        localStorage.setItem('ssaems_allotments', JSON.stringify(allotments));
      }
    }
    alert(`Request ${action} successfully!`);
    computeStats(subjects);
  }

  function bulkApproveRequests(requestIds) {
    const userConfirmed = window.confirm(`Are you sure you want to approve ${requestIds.length} requests?`);
    if (!userConfirmed) return;
    requestIds.forEach(id => handleRequest(id, 'approved', 'Bulk approved by admin'));
  }

  function bulkDenyRequests(requestIds) {
    const userConfirmed = window.confirm(`Are you sure you want to deny ${requestIds.length} requests?`);
    if (!userConfirmed) return;
    requestIds.forEach(id => handleRequest(id, 'denied', 'Bulk denied by admin'));
  }

  // Admin utility: call backend to backfill missing subject codes
  async function backfillSubjectCodes() {
    const ok = window.confirm('Backfill missing subject codes for existing subjects? This will assign generated codes to any subject without one.');
    if (!ok) return;
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/admin/subjects/backfill-codes', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Backfill failed');
      }
      const data = await resp.json();
      alert(`Backfill complete. ${data.updated || data.updatedCount || 0} subjects updated.`);
      // reload subjects list
      window.location.reload();
    } catch (e) {
      alert(e.message || 'Backfill failed');
    }
  }

  // Admin utility: delete all subjects (destructive)
  async function clearAllSubjects() {
    const userConfirmed = window.confirm('DELETE ALL SUBJECTS? This cannot be undone. Are you sure?');
    if (!userConfirmed) return;
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/admin/subjects', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Clear failed');
      }
      const data = await resp.json();
      alert(data.message || 'All subjects cleared');
      setSubjects([]);
      computeStats([]);
      try { localStorage.setItem('ssaems_subjects_dirty', String(Date.now())); } catch (_) {}
    } catch (e) {
      alert(e.message || 'Clear failed');
    }
  }

  async function fetchRegisteredElectives() {
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/admin/registered-electives', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setRegisteredStudents(data.registrations || []);
      } else {
        setRegisteredStudents([]);
      }
    } catch (e) {
      console.error('Failed to fetch registered electives', e);
      setRegisteredStudents([]);
    }
  }

  function downloadRegisteredElectivesExcel() {
    if (registeredStudents.length === 0) {
      alert('No registrations to download');
      return;
    }

    // Create CSV content
    let csv = 'Roll Number,Name,Email,Department,Year,Semester,CGPA,Priority 1,Priority 2,Priority 3,Priority 4,Priority 5\n';
    
    registeredStudents.forEach(student => {
      const prefs = student.preferences || [];
      const p1 = prefs[0] ? `${prefs[0].code} - ${prefs[0].title}` : '';
      const p2 = prefs[1] ? `${prefs[1].code} - ${prefs[1].title}` : '';
      const p3 = prefs[2] ? `${prefs[2].code} - ${prefs[2].title}` : '';
      const p4 = prefs[3] ? `${prefs[3].code} - ${prefs[3].title}` : '';
      const p5 = prefs[4] ? `${prefs[4].code} - ${prefs[4].title}` : '';
      
      csv += `${student.rollNumber},"${student.name}",${student.email},${student.department},${student.year},${student.semester},${student.cgpa},"${p1}","${p2}","${p3}","${p4}","${p5}"\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registered_electives_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function StudentRequestsTable({ subjects, onHandleRequest, onBulkApprove, onBulkDeny }) {
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [requestFilter, setRequestFilter] = useState('all');
    const requests = JSON.parse(localStorage.getItem('ssaems_requests')||'[]');
    const users = JSON.parse(localStorage.getItem('ssaems_users')||'[]');
    const filteredRequests = requests.filter(r => {
      if (requestFilter === 'pending') return r.status === 'pending';
      if (requestFilter === 'approved') return r.status === 'approved';
      if (requestFilter === 'denied') return r.status === 'denied';
      return true;
    });
    const getStudentDetails = (studentId) => users.find(u => u.idNumber === studentId) || { name: 'Unknown', cgpa: 'N/A' };
    const getSubjectName = (subjectId) => subjects.find(s => s.id === subjectId)?.name || subjectId;
    return (
      <div>
        <div style={{display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
          <select value={requestFilter} onChange={e => setRequestFilter(e.target.value)}>
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          {selectedRequests.length > 0 && (
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="btn small" onClick={() => onBulkApprove(selectedRequests)}>
                Approve Selected ({selectedRequests.length})
              </button>
              <button className="btn outline small" onClick={() => onBulkDeny(selectedRequests)}>
                Deny Selected ({selectedRequests.length})
              </button>
              <button className="btn outline small" onClick={() => setSelectedRequests([])}>
                Clear Selection
              </button>
            </div>
          )}
        </div>
        {filteredRequests.length === 0 ? (
          <p className="muted">No {requestFilter === 'all' ? '' : requestFilter} requests found.</p>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #e2e8f0', background: '#f8fafc'}}>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>
                    <input 
                      type="checkbox" 
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedRequests(filteredRequests.filter(r => r.status === 'pending').map(r => r.id));
                        } else {
                          setSelectedRequests([]);
                        }
                      }}
                    />
                  </th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Student</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>CGPA</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Current Subject</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Requested Subject</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Reason</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Status</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => {
                  const student = getStudentDetails(request.student);
                  return (
                    <tr key={request.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{padding: '12px 8px'}}>
                        {request.status === 'pending' && (
                          <input 
                            type="checkbox" 
                            checked={selectedRequests.includes(request.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedRequests([...selectedRequests, request.id]);
                              } else {
                                setSelectedRequests(selectedRequests.filter(id => id !== request.id));
                              }
                            }}
                          />
                        )}
                      </td>
                      <td style={{padding: '12px 8px'}}>
                        <div>
                          <strong>{student.name}</strong>
                          <br />
                          <small style={{color: '#64748b'}}>{request.student}</small>
                        </div>
                      </td>
                      <td style={{padding: '12px 8px'}}>{student.cgpa}</td>
                      <td style={{padding: '12px 8px'}}>{request.current?.name || getSubjectName(request.current)}</td>
                      <td style={{padding: '12px 8px'}}>{getSubjectName(request.requested)}</td>
                      <td style={{padding: '12px 8px', maxWidth: '200px'}}>
                        <div style={{overflow: 'hidden', textOverflow: 'ellipsis'}} title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                      <td style={{padding: '12px 8px'}}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: request.status === 'pending' ? '#f59e0b' : 
                                    request.status === 'approved' ? '#10b981' : '#ef4444'
                        }}>
                          {request.status.toUpperCase()}
                        </span>
                        {request.adminNote && (
                          <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                            Note: {request.adminNote}
                          </div>
                        )}
                      </td>
                      <td style={{padding: '12px 8px'}}>
                        {request.status === 'pending' && (
                          <div style={{display: 'flex', gap: '4px'}}>
                            <button 
                              className="btn small" 
                              onClick={() => {
                                const note = prompt('Add admin note (optional):');
                                onHandleRequest(request.id, 'approved', note || '');
                              }}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn outline small" 
                              onClick={() => {
                                const note = prompt('Add admin note (optional):');
                                onHandleRequest(request.id, 'denied', note || '');
                              }}
                            >
                              Deny
                            </button>
                          </div>
                        )}
                        {request.status !== 'pending' && request.resolvedAt && (
                          <div style={{fontSize: '12px', color: '#64748b'}}>
                            {new Date(request.resolvedAt).toLocaleDateString()}
                            <br />by {request.resolvedBy}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function FacultyActionsTable({ subjects, onHandleRequest }) {
    const requests = JSON.parse(localStorage.getItem('ssaems_requests')||'[]');
    const users = JSON.parse(localStorage.getItem('ssaems_users')||'[]');
    const facultyProcessedRequests = requests.filter(r => 
      r.status !== 'pending' && (!r.resolvedBy || r.resolvedBy !== 'Admin')
    );
    const getStudentDetails = (studentId) => users.find(u => u.idNumber === studentId) || { name: 'Unknown' };
    const getSubjectName = (subjectId) => subjects.find(s => s.id === subjectId)?.name || subjectId;
    return (
      <div>
        {facultyProcessedRequests.length === 0 ? (
          <p className="muted">No faculty actions recorded yet.</p>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #e2e8f0', background: '#f8fafc'}}>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Date</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Student</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Request</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Faculty Action</th>
                  <th style={{padding: '12px 8px', textAlign: 'left'}}>Admin Override</th>
                </tr>
              </thead>
              <tbody>
                {facultyProcessedRequests.map(request => {
                  const student = getStudentDetails(request.student);
                  return (
                    <tr key={request.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{padding: '12px 8px'}}>
                        {request.resolvedAt ? new Date(request.resolvedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{padding: '12px 8px'}}>{student.name}</td>
                      <td style={{padding: '12px 8px'}}>
                        {getSubjectName(request.current)} → {getSubjectName(request.requested)}
                      </td>
                      <td style={{padding: '12px 8px'}}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: request.status === 'approved' ? '#10b981' : '#ef4444'
                        }}>
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{padding: '12px 8px'}}>
                        <div style={{display: 'flex', gap: '4px'}}>
                          <button 
                            className="btn small" 
                            onClick={() => {
                              const note = prompt('Add admin override note:');
                              onHandleRequest(request.id, 'approved', `Admin Override: ${note || 'No note'}`);
                            }}
                            disabled={request.status === 'approved'}
                          >
                            Override Approve
                          </button>
                          <button 
                            className="btn outline small" 
                            onClick={() => {
                              const note = prompt('Add admin override note:');
                              onHandleRequest(request.id, 'denied', `Admin Override: ${note || 'No note'}`);
                            }}
                            disabled={request.status === 'denied'}
                          >
                            Override Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function RequestAnalytics() {
    const requests = JSON.parse(localStorage.getItem('ssaems_requests')||'[]');
    const analytics = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      denied: requests.filter(r => r.status === 'denied').length,
      approvalRate: requests.length > 0 ? ((requests.filter(r => r.status === 'approved').length) / requests.length * 100).toFixed(1) : 0
    };
    const subjectRequests = {};
    requests.forEach(r => {
      const subjectName = subjects.find(s => s.id === r.requested)?.name || r.requested;
      subjectRequests[subjectName] = (subjectRequests[subjectName] || 0) + 1;
    });
    const topRequestedSubjects = Object.entries(subjectRequests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    return (
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
        <div style={{padding: '16px', background: '#f8fafc', borderRadius: '8px'}}>
          <h6>Request Statistics</h6>
          <p><strong>Total Requests:</strong> {analytics.total}</p>
          <p><strong>Pending:</strong> {analytics.pending}</p>
          <p><strong>Approved:</strong> {analytics.approved}</p>
          <p><strong>Denied:</strong> {analytics.denied}</p>
          <p><strong>Approval Rate:</strong> {analytics.approvalRate}%</p>
        </div>
        <div style={{padding: '16px', background: '#f8fafc', borderRadius: '8px'}}>
          <h6>Most Requested Subjects</h6>
          {topRequestedSubjects.length === 0 ? (
            <p className="muted">No request data available</p>
          ) : (
            <div>
              {topRequestedSubjects.map(([subject, count], i) => (
                <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                  <span>{subject}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{padding: '16px', background: '#f8fafc', borderRadius: '8px'}}>
          <h6>Request Trends</h6>
          <div style={{maxWidth: 200}}>
            <Doughnut 
              data={{
                labels: ['Pending', 'Approved', 'Denied'],
                datasets: [{
                  data: [analytics.pending, analytics.approved, analytics.denied],
                  backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
                }]
              }}
              options={{
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="container" style={{ paddingBottom: 32 }}>
        <div className="hero" style={{marginBottom: '32px', textAlign: 'center'}}>
          <h2>Admin Dashboard</h2>
          <p>Comprehensive management of the Smart Subject Allocation System</p>
        </div>
        <div className="card" style={{marginBottom: '24px'}}>
          <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
            {[
              {id: 'overview', label: 'Overview & Analytics'},
              {id: 'subjects', label: 'Subject Management'},
              {id: 'registered', label: 'Registered Electives'},
              {id: 'allocation', label: 'Allocation Control'},
              {id: 'requests', label: 'Request Management'},
              {id: 'reports', label: 'Reports & History'},
              {id: 'settings', label: 'System Settings'}
            ].map(tab => (
              <button 
                key={tab.id}
                style={activeTab === tab.id ? btnStyle : btnOutlineStyle}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
            <div style={{marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center'}}>
              <button className="btn outline" style={{padding: '8px 12px'}} onClick={backfillSubjectCodes}>Backfill Missing Subject Codes</button>
              <button className="btn outline" style={{padding: '8px 12px', background: '#fff', color: '#b91c1c', borderColor: '#fecaca'}} onClick={clearAllSubjects}>Clear All Subjects</button>
            </div>
          </div>
        </div>
        {activeTab === 'overview' && (
          <div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
              <div className="card" style={{textAlign: 'center', background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: 'white'}}>
                <h3>Total Students</h3>
                <p style={{fontSize: '24px', fontWeight: 'bold'}}>{JSON.parse(localStorage.getItem('ssaems_users')||'[]').filter(u=>u.role==='student').length}</p>
              </div>
              <div className="card" style={{textAlign: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h3>Total Subjects</h3>
                <p style={{fontSize: '24px', fontWeight: 'bold'}}>{subjects.length}</p>
              </div>
              <div className="card" style={{textAlign: 'center', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white'}}>
                <h3>Allocated</h3>
                <p style={{fontSize: '24px', fontWeight: 'bold'}}>{Object.keys(JSON.parse(localStorage.getItem('ssaems_allotments')||'{}')).length}</p>
              </div>
              <div className="card" style={{textAlign: 'center', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white'}}>
                <h3>Pending Requests</h3>
                <p style={{fontSize: '24px', fontWeight: 'bold'}}>{JSON.parse(localStorage.getItem('ssaems_requests')||'[]').filter(r=>r.status==='pending').length}</p>
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px'}}>
              <section className="card">
                <h4>Course Enrollment Distribution</h4>
                <div style={{maxWidth: 400, margin: '0 auto'}}>
                  <Pie data={{ 
                    labels: stats.labels, 
                    datasets: [{ 
                      data: stats.data, 
                      backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#C9CBCF','#8A2BE2','#00CED1','#FFD700'] 
                    }] 
                  }} />
                </div>
              </section>
              <section className="card">
                <h4>Enrollments by Subject</h4>
                <div style={{height: 300}}>
                  <Bar 
                    data={{
                      labels: stats.labels,
                      datasets: [{
                        label: 'Students',
                        data: stats.data,
                        backgroundColor: 'rgba(37,99,235,0.6)'
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true } } }}
                  />
                </div>
              </section>
              <section className="card">
                <h4>Allocation History</h4>
                {allocationHistory.length === 0 ? (
                  <p className="muted">No allocation history available</p>
                ) : (
                  <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {allocationHistory.slice(-5).reverse().map((entry, i) => (
                      <div key={i} style={{padding: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '8px'}}>
                        <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
                        <p><strong>Allocation Rate:</strong> {entry.allocatedPercentage}% ({entry.allocated}/{entry.totalStudents})</p>
                        <p><strong>Unallocated:</strong> {entry.unallocated}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
        {activeTab === 'subjects' && (
          <div>
            <div className="card">
              <h4>Add New Subject</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <input placeholder="Subject Name" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} />
                <input type="number" placeholder="Credits" value={newSubject.credits} onChange={e => setNewSubject({...newSubject, credits: parseInt(e.target.value)})} />
                <input type="number" placeholder="Hours/Week" value={newSubject.hours} onChange={e => setNewSubject({...newSubject, hours: parseInt(e.target.value)})} />
                <input type="number" placeholder="Capacity" value={newSubject.capacity} onChange={e => setNewSubject({...newSubject, capacity: parseInt(e.target.value)})} />
                <input placeholder="Faculty" value={newSubject.faculty} onChange={e => setNewSubject({...newSubject, faculty: e.target.value})} />
                
                <select value={newSubject.year} onChange={e => setNewSubject({...newSubject, year: e.target.value})} style={{padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0'}}>
                  <option value="">Select Year *</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                
                <select value={newSubject.semester} onChange={e => setNewSubject({...newSubject, semester: e.target.value})} style={{padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0'}}>
                  <option value="">Select Semester *</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
              <textarea placeholder="Description" value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})} style={{width: '100%', marginTop: '16px'}} />
              <input placeholder="Topics (comma-separated)" value={newSubject.topics} onChange={e => setNewSubject({...newSubject, topics: e.target.value})} style={{width: '100%', marginTop: '8px'}} />
              <button className="btn" onClick={addSubject} style={{marginTop: '16px'}}>Add Subject</button>
              
            </div>
            <div className="card">
              <h4>Existing Subjects</h4>
              <div style={{display: 'grid', gap: '16px'}}>
                {subjects.map(subject => (
                  <div key={subject.id} style={{border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                      <div>
                        <h5>{subject.name}</h5>
                        <p><strong>Code:</strong> {subject.code} | <strong>Credits:</strong> {subject.credits} | <strong>Hours:</strong> {subject.hours} | <strong>Capacity:</strong> {subject.capacity}</p>
                        <p><strong>Faculty:</strong> {subject.faculty}</p>
                        <p><strong>Year:</strong> {subject.year ? `${subject.year}${subject.year === '1' ? 'st' : subject.year === '2' ? 'nd' : subject.year === '3' ? 'rd' : 'th'} Year` : 'Not specified'} | <strong>Semester:</strong> {subject.semester ? `Semester ${subject.semester}` : 'Not specified'}</p>
                        <p><strong>Description:</strong> {subject.description}</p>
                        <p><strong>Topics:</strong> {Array.isArray(subject.topics) ? subject.topics.join(', ') : subject.topics}</p>
                      </div>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button className="btn small" style={btnStyle} onClick={() => editSubject(subject)}>Edit</button>
                        <button className="btn outline small" style={btnOutlineStyle} onClick={() => deleteSubject(subject.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {editingSubject && (
              <div className="modal" style={{position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px', zIndex: 1000}}>
                <h4>Edit Subject</h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                  <input placeholder="Subject Name" value={editingSubject.name} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} />
                  <input type="number" placeholder="Credits" value={editingSubject.credits} onChange={e => setEditingSubject({...editingSubject, credits: parseInt(e.target.value)})} />
                  <input type="number" placeholder="Hours/Week" value={editingSubject.hours} onChange={e => setEditingSubject({...editingSubject, hours: parseInt(e.target.value)})} />
                  <input type="number" placeholder="Capacity" value={editingSubject.capacity} onChange={e => setEditingSubject({...editingSubject, capacity: parseInt(e.target.value)})} />
                  <input placeholder="Faculty" value={editingSubject.faculty} onChange={e => setEditingSubject({...editingSubject, faculty: e.target.value})} />
                  <select 
                    value={editingSubject.year || ''} 
                    onChange={e => setEditingSubject({...editingSubject, year: e.target.value})}
                    style={{padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px'}}
                  >
                    <option value="">Select Year *</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <select 
                    value={editingSubject.semester || ''} 
                    onChange={e => setEditingSubject({...editingSubject, semester: e.target.value})}
                    style={{padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px'}}
                  >
                    <option value="">Select Semester *</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
                <textarea placeholder="Description" value={editingSubject.description || ''} onChange={e => setEditingSubject({...editingSubject, description: e.target.value})} style={{width: '100%', marginTop: '16px'}} />
                <input placeholder="Topics (comma-separated)" value={Array.isArray(editingSubject.topics) ? editingSubject.topics.join(', ') : editingSubject.topics || ''} onChange={e => setEditingSubject({...editingSubject, topics: e.target.value})} style={{width: '100%', marginTop: '8px'}} />
                <div style={{marginTop: '16px', display: 'flex', gap: '8px'}}>
                  <button className="btn" onClick={updateSubject}>Update Subject</button>
                  <button className="btn outline" onClick={() => setEditingSubject(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'registered' && (
          <div>
            <div className="card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h4>Registered Electives</h4>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button className="btn" style={btnStyle} onClick={fetchRegisteredElectives}>
                    Refresh
                  </button>
                  <button className="btn" style={{...btnStyle, background: 'linear-gradient(135deg, #16a34a, #15803d)'}} onClick={downloadRegisteredElectivesExcel}>
                    Download Excel
                  </button>
                </div>
              </div>
              
              {registeredStudents.length === 0 ? (
                <p style={{color: '#666', textAlign: 'center', padding: '24px'}}>No students have registered their preferences yet.</p>
              ) : (
                <div>
                  <p style={{color: '#666', marginBottom: '16px'}}>
                    Total Registrations: <strong>{registeredStudents.length}</strong> students
                    {registeredStudents.length > 0 && (
                      <span style={{marginLeft: '16px'}}>
                        | Locked: <strong>{registeredStudents.filter(s => s.preferencesLocked).length}</strong>
                      </span>
                    )}
                  </p>
                  <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                      <thead>
                        <tr style={{borderBottom: '2px solid #e2e8f0', background: '#f8fafc'}}>
                          <th style={{padding: '12px 8px', textAlign: 'left'}}>Roll No</th>
                          <th style={{padding: '12px 8px', textAlign: 'left'}}>Name</th>
                          <th style={{padding: '12px 8px', textAlign: 'left'}}>Email</th>
                          <th style={{padding: '12px 8px', textAlign: 'left'}}>Year/Sem</th>
                          <th style={{padding: '12px 8px', textAlign: 'left'}}>CGPA</th>
                          <th style={{padding: '12px 8px', textAlign: 'left'}}>Status</th>
                          <th style={{padding: '12px 8px', textAlign: 'left'}}>Preferences</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredStudents.map(student => (
                          <tr key={student.studentId} style={{borderBottom: '1px solid #e2e8f0', background: student.preferencesLocked ? '#f0fdf4' : 'transparent'}}>
                            <td style={{padding: '12px 8px'}}>{student.rollNumber}</td>
                            <td style={{padding: '12px 8px'}}>{student.name}</td>
                            <td style={{padding: '12px 8px', fontSize: '12px', color: '#64748b'}}>{student.email}</td>
                            <td style={{padding: '12px 8px'}}>Y{student.year}/S{student.semester}</td>
                            <td style={{padding: '12px 8px'}}>{student.cgpa}</td>
                            <td style={{padding: '12px 8px'}}>
                              {student.preferencesLocked ? (
                                <span style={{color: '#16a34a', fontSize: '12px', fontWeight: 'bold'}}>
                                  🔒 Locked
                                </span>
                              ) : (
                                <span style={{color: '#f59e0b', fontSize: '12px'}}>
                                  Draft
                                </span>
                              )}
                              {student.submittedAt && (
                                <div style={{fontSize: '10px', color: '#64748b', marginTop: '2px'}}>
                                  {new Date(student.submittedAt).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td style={{padding: '12px 8px'}}>
                              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                {(student.preferences || []).map((pref, idx) => (
                                  <div key={idx} style={{fontSize: '12px'}}>
                                    <span style={{fontWeight: 'bold', color: '#1976d2'}}>#{pref.priority}</span>
                                    {' '}
                                    <span style={{color: '#334155'}}>{pref.code} - {pref.title}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'allocation' && (
          <div>
            <div className="card">
              <h4>Allocation Controls</h4>
              <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
                <button className="btn" style={btnStyle} onClick={runAllocation} disabled={systemSettings.allocationLocked}>
                  {systemSettings.allocationLocked ? 'Allocation Locked' : 'Run Allocation Algorithm'}
                </button>
                <button className="btn outline" style={btnOutlineStyle} onClick={clearAllAllocations}>Clear All Allocations</button>
                <button className="btn outline" style={btnOutlineStyle} onClick={exportCSV}>Export CSV</button>
                <button className="btn outline" style={btnOutlineStyle} onClick={generateReports}>Generate System Report</button>
              </div>
              {systemSettings.allocationLocked && (
                <p style={{color: '#ef4444', marginTop: '8px'}}>⚠ Allocation is currently locked. Change in System Settings to enable.</p>
              )}
            </div>
            <div className="card">
              <h4>Allocation Preview</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                {subjects.map(subject => {
                  const allocated = Object.values(JSON.parse(localStorage.getItem('ssaems_allotments')||'{}')).filter(a => a.id === subject.id).length;
                  const utilization = ((allocated / subject.capacity) * 100).toFixed(1);
                  return (
                    <div key={subject.id} style={{border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px'}}>
                      <h6>{subject.name}</h6>
                      <p><strong>Capacity:</strong> {subject.capacity}</p>
                      <p><strong>Allocated:</strong> {allocated}</p>
                      <p><strong>Available:</strong> {subject.capacity - allocated}</p>
                      <p><strong>Utilization:</strong> {utilization}%</p>
                      <div style={{background: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden'}}>
                        <div style={{background: Number(utilization) > 90 ? '#ef4444' : Number(utilization) > 70 ? '#f59e0b' : '#10b981', width: `${Math.min(Number(utilization), 100)}%`, height: '100%'}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'requests' && (
          <div>
            <div className="card">
              <h4>Student Change Requests</h4>
              <StudentRequestsTable 
                subjects={subjects}
                onHandleRequest={handleRequest}
                onBulkApprove={bulkApproveRequests}
                onBulkDeny={bulkDenyRequests}
              />
            </div>
            <div className="card">
              <h4>Faculty Actions & Updates</h4>
              <FacultyActionsTable 
                subjects={subjects}
                onHandleRequest={handleRequest}
              />
            </div>
            <div className="card">
              <h4>Request Analytics</h4>
              <RequestAnalytics />
            </div>
          </div>
        )}
        {activeTab === 'reports' && (
          <div>
            <div className="card">
              <h4>System Reports</h4>
              <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
                <button className="btn" style={btnStyle} onClick={generateReports}>Generate Summary Report</button>
                <button className="btn outline" style={btnOutlineStyle} onClick={exportCSV}>Export Student Data</button>
              </div>
            </div>
            <div className="card">
              <h4>Allocation History</h4>
              {allocationHistory.length === 0 ? (
                <p className="muted">No allocation history available</p>
              ) : (
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{borderBottom: '2px solid #e2e8f0'}}>
                        <th style={{padding: '8px', textAlign: 'left'}}>Date</th>
                        <th style={{padding: '8px', textAlign: 'left'}}>Total Students</th>
                        <th style={{padding: '8px', textAlign: 'left'}}>Allocated</th>
                        <th style={{padding: '8px', textAlign: 'left'}}>Unallocated</th>
                        <th style={{padding: '8px', textAlign: 'left'}}>Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocationHistory.map((entry, i) => (
                        <tr key={i} style={{borderBottom: '1px solid #e2e8f0'}}>
                          <td style={{padding: '8px'}}>{new Date(entry.date).toLocaleDateString()}</td>
                          <td style={{padding: '8px'}}>{entry.totalStudents}</td>
                          <td style={{padding: '8px'}}>{entry.allocated}</td>
                          <td style={{padding: '8px'}}>{entry.unallocated}</td>
                          <td style={{padding: '8px'}}>{entry.allocatedPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div>
            <div className="card">
              <h4>System Settings</h4>
              <div style={{display: 'grid', gap: '16px', maxWidth: '400px'}}>
                <label>
                  Semester
                  <input value={systemSettings.semester} onChange={e => setSystemSettings({...systemSettings, semester: e.target.value})} />
                </label>
                <label>
                  Maximum Preferences per Student
                  <input type="number" min="1" max="10" value={systemSettings.maxPreferences} onChange={e => setSystemSettings({...systemSettings, maxPreferences: parseInt(e.target.value)})} />
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <input type="checkbox" checked={systemSettings.registrationOpen} onChange={e => setSystemSettings({...systemSettings, registrationOpen: e.target.checked})} />
                  Registration Open
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <input type="checkbox" checked={systemSettings.allocationLocked} onChange={e => setSystemSettings({...systemSettings, allocationLocked: e.target.checked})} />
                  Lock Allocation (Prevents new allocations)
                </label>
                <button className="btn" style={btnStyle} onClick={saveSystemSettings}>Save Settings</button>
              </div>
            </div>
            <div className="card">
              <h4>System Information</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <div>
                  <h6>Database Status</h6>
                  <p style={{color: '#10b981'}}>✅ Connected (LocalStorage)</p>
                </div>
                <div>
                  <h6>Last Allocation</h6>
                  <p>{allocationHistory.length > 0 ? new Date(allocationHistory[allocationHistory.length - 1].date).toLocaleDateString() : 'Never'}</p>
                </div>
                <div>
                  <h6>System Version</h6>
                  <p>SSAEMS v1.0.0</p>
                </div>
                <div>
                  <h6>Total Users</h6>
                  <p>{JSON.parse(localStorage.getItem('ssaems_users')||'[]').length}</p>
                </div>
          </div>
        </div>
        </div>
        )}
      </main>

      {/* File Upload Dialog */}
      {showUploadDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{marginTop: 0}}>Upload Student Data</h3>
            <p style={{color: '#64748b', marginBottom: '24px'}}>
              Upload a CSV or Excel file containing student information to run the allocation algorithm.
            </p>
            
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '24px',
              backgroundColor: '#f8fafc'
            }}>
              <input 
                type="file" 
                accept=".csv,.xls,.xlsx"
                onChange={handleFileUpload}
                style={{display: 'none'}}
                id="fileUpload"
              />
              <label htmlFor="fileUpload" style={{cursor: 'pointer'}}>
                <div style={{fontSize: '48px', marginBottom: '8px'}}>📄</div>
                <div style={{fontWeight: '500', marginBottom: '4px'}}>
                  {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                </div>
                <div style={{fontSize: '14px', color: '#64748b'}}>
                  CSV or Excel files only
                </div>
              </label>
            </div>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              <strong>Expected Format:</strong>
              <br />
              studentId, name, email, cgpa, preferences (optional)
              <br />
              <span style={{color: '#64748b', fontSize: '12px'}}>
                Example: STU001, John Doe, john@example.com, 8.5
              </span>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button 
                style={btnOutlineStyle} 
                onClick={() => {
                  setShowUploadDialog(false);
                  setUploadedFile(null);
                }}
              >
                Cancel
              </button>
              <button 
                style={btnStyle} 
                onClick={processAllocationFile}
                disabled={!uploadedFile}
              >
                Run Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
