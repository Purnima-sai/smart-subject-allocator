import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterAltIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const FacultyDashboard = () => {
  const navigate = useNavigate();

  // Header style for consistency across dashboards
  const headerStyle = {
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  // Dynamic faculty state (will fetch real subjects/information later)
  const [faculty, setFaculty] = React.useState({
    name: 'Loading...',
    designation: '',
    experience: 0,
    coursesTaught: 0,
    studentsAllocated: 0,
    courseIds: [],
  });
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [loadingRequests, setLoadingRequests] = React.useState(true);
  const [loadingAllocations, setLoadingAllocations] = React.useState(true);
  const [error, setError] = React.useState('');

  const [allottedStudents, setAllottedStudents] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [studentQuery, setStudentQuery] = React.useState('');
  const [studentPage, setStudentPage] = React.useState(1);
  const pageSize = 5;
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [sortKey, setSortKey] = React.useState('name'); // 'name' | 'regd' | 'course'
  const [sortDir, setSortDir] = React.useState('asc'); // 'asc' | 'desc'
  const [reqOpen, setReqOpen] = React.useState(false);
  const [reqIndex, setReqIndex] = React.useState(null);

  // Fetch subjects taught by this faculty
  const fetchFacultySubjects = React.useCallback(async () => {
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/faculty/my-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to load faculty subjects');
      const data = await resp.json();
      const subjects = data.subjects || [];
      setFaculty((prev) => ({
        ...prev,
        name: (JSON.parse(localStorage.getItem('user')||'{}').name) || prev.name,
        designation: prev.designation || 'Faculty',
        coursesTaught: subjects.length,
        courseIds: subjects.map(s => s.code || s._id).filter(Boolean),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchChangeRequests = React.useCallback(async () => {
    setLoadingRequests(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/faculty/change-requests?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to load change requests');
      const data = await resp.json();
      const mapped = (data.requests || []).map(r => ({
        id: r._id,
        userId: r.student?.rollNumber || 'Unknown',
        wantsChange: 'yes',
        reason: r.reason || '',
        newCourse: r.requestedSubject?.code || r.requestedSubject?.title || 'Unknown',
        status: r.status === 'pending' ? null : r.status,
        createdAt: r.createdAt,
        raw: r,
      }));
      setRequests(mapped);
    } catch (e) {
      setError(e.message);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const fetchAllocations = React.useCallback(async () => {
    setLoadingAllocations(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch all allocations (backend can be filtered by subjectId in the future)
      const resp = await fetch('/api/faculty/allocations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to load allocations');
      const data = await resp.json();
      const rows = (data.allocations || []).map(a => ({
        name: a.student?.name || 'Unknown',
        regd: a.student?.rollNumber || '-',
        courseId: a.subject?.code || a.subject?._id,
        courseName: a.subject?.title || '-',
      }));
      setAllottedStudents(rows);
    } catch (e) {
      setError(e.message);
      setAllottedStudents([]);
    } finally {
      setLoadingAllocations(false);
    }
  }, [faculty.courseIds]);

  React.useEffect(() => {
    fetchFacultySubjects();
  }, [fetchFacultySubjects]);

  React.useEffect(() => {
    if (faculty.courseIds.length > 0) {
      fetchChangeRequests();
      fetchAllocations();
    }
  }, [faculty.courseIds, fetchChangeRequests, fetchAllocations]);

  const approveOrDeny = async (idx, action) => {
    try {
      const token = localStorage.getItem('token');
      const reqObj = requests[idx];
      if (!reqObj) return;
      const resp = await fetch('/api/faculty/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestId: reqObj.id, action })
      });
      if (!resp.ok) throw new Error('Failed to update request');
      await fetchChangeRequests();
    } catch (e) {
      setError(e.message);
    }
  };

  const updateRequestStatus = (idx, status) => {
    // Legacy local update replaced by approveOrDeny
    approveOrDeny(idx, status === 'approved' ? 'approve' : 'deny');
  };

  const filteredRequests = React.useMemo(() => {
    return courseFilter === 'all' ? requests : requests.filter((r) => r.newCourse === courseFilter);
  }, [requests, courseFilter]);

  const exportStudentsCsv = (rows) => {
    const header = ['Name', 'Regd No', 'Course ID', 'Course Name'];
    const lines = rows.map((s) => [s.name, s.regd, s.courseId, s.courseName].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'allotted_students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={headerStyle}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Faculty Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, {faculty.name}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 5, height: '100%' }}>
            <PeopleIcon color="primary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{allottedStudents.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Students</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 5, height: '100%' }}>
            <FilterAltIcon color="warning" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{filteredRequests.filter(r => !r.status).length}</Typography>
              <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
            <SchoolIcon color="success" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{faculty.courseIds.length}</Typography>
              <Typography variant="body2" color="text.secondary">Courses Handling</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Profile & Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Profile Summary</Typography>
            <Typography><strong>Designation:</strong> {faculty.designation}</Typography>
            <Typography><strong>Experience:</strong> {faculty.experience} years</Typography>
            <Typography><strong>Courses Taught:</strong> {faculty.coursesTaught}</Typography>
            <Typography sx={{ mt: 1 }}><strong>Handling Courses:</strong> {faculty.courseIds.join(', ')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Allocation Overview</Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon fontSize="small" /> Students Allocated: <Chip label={allottedStudents.length} color="primary" />
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon fontSize="small" />
              <Typography variant="body2" color="text.secondary">Use the Student Requests page to approve or deny change requests.</Typography>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => { fetchFacultySubjects(); fetchChangeRequests(); fetchAllocations(); }}>Refresh</Button>
              <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => exportStudentsCsv(allottedStudents)}>Export CSV</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Student Requests (placed next to Allocation Overview) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Student Change Requests {loadingRequests && '…'}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterAltIcon fontSize="small" />
                  <Chip label="All" color={courseFilter === 'all' ? 'primary' : 'default'} variant={courseFilter === 'all' ? 'filled' : 'outlined'} onClick={() => setCourseFilter('all')} />
                  {faculty.courseIds.map((cid) => (
                    <Chip key={cid} label={cid} color={courseFilter === cid ? 'primary' : 'default'} variant={courseFilter === cid ? 'filled' : 'outlined'} onClick={() => setCourseFilter(cid)} />
                  ))}
                </Stack>
                <Chip label={`${filteredRequests.filter(r => !r.status).length} pending`} color="warning" />
              </Stack>
            </Box>
            {error && (
              <Typography color="error" sx={{ mb:2 }}>{error}</Typography>
            )}
            {loadingRequests && filteredRequests.length === 0 ? (
              <Typography color="text.secondary">Loading requests…</Typography>
            ) : filteredRequests.length === 0 ? (
              <Typography color="text.secondary">No student requests found.</Typography>
            ) : (
              <List>
                {filteredRequests.map((r, idx) => (
                  <React.Fragment key={`${r.userId || idx}-${r.createdAt || idx}`}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={(
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{r.userId || 'Unknown Student'}</Typography>
                            {r.status && <Chip size="small" label={r.status} color={r.status === 'approved' ? 'success' : 'default'} />}
                          </Stack>
                        )}
                        secondary={(
                          <>
                            <Typography variant="body2" color="text.secondary" display="block">Requested Change: {r.wantsChange === 'yes' ? 'Yes' : 'No'}</Typography>
                            {r.wantsChange === 'yes' && (
                              <>
                                <Typography variant="body2" display="block"><strong>Reason:</strong> {r.reason || '-'}</Typography>
                                <Typography variant="body2" display="block"><strong>Preferred Course:</strong> {r.newCourse || '-'}</Typography>
                              </>
                            )}
                            <Typography variant="caption" color="text.secondary">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</Typography>
                          </>
                        )}
                      />
                      <Stack direction="row" spacing={1}>
                        {!r.status && !loadingRequests && (
                          <>
                            <Button size="small" variant="contained" color="success" onClick={() => updateRequestStatus(idx, 'approved')}>Approve</Button>
                            <Button size="small" variant="outlined" onClick={() => updateRequestStatus(idx, 'denied')}>Deny</Button>
                          </>
                        )}
                        <Button size="small" onClick={() => { setReqIndex(idx); setReqOpen(true); }}>Details</Button>
                      </Stack>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Allotted Students List */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Allotted Students</Typography>
            <Box sx={{ display: 'flex', gap: 12, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterAltIcon fontSize="small" />
                <Chip
                  label="All"
                  color={courseFilter === 'all' ? 'primary' : 'default'}
                  variant={courseFilter === 'all' ? 'filled' : 'outlined'}
                  onClick={() => { setCourseFilter('all'); setStudentPage(1); }}
                />
                {faculty.courseIds.map((cid) => (
                  <Chip key={cid} label={cid} color={courseFilter === cid ? 'primary' : 'default'} variant={courseFilter === cid ? 'filled' : 'outlined'} onClick={() => { setCourseFilter(cid); setStudentPage(1); }} />
                ))}
              </Stack>
              <TextField
                size="small"
                label="Search by name, regd no., or course"
                value={studentQuery}
                onChange={(e) => { setStudentQuery(e.target.value); setStudentPage(1); }}
                sx={{ minWidth: { xs: '100%', sm: 320 } }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select labelId="sort-by-label" label="Sort By" value={sortKey} onChange={(e)=>{ setSortKey(e.target.value); setStudentPage(1); }}>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="regd">Regd No</MenuItem>
                  <MenuItem value="course">Course</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-dir-label">Order</InputLabel>
                <Select labelId="sort-dir-label" label="Order" value={sortDir} onChange={(e)=>{ setSortDir(e.target.value); setStudentPage(1); }}>
                  <MenuItem value="asc">Asc</MenuItem>
                  <MenuItem value="desc">Desc</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {allottedStudents.length === 0 ? (
              <Typography color="text.secondary">No students have been allotted to your courses yet.</Typography>
            ) : (
              <>
                {(() => {
                  const q = studentQuery.trim().toLowerCase();
                  const pool = courseFilter === 'all' ? allottedStudents : allottedStudents.filter((s) => s.courseId === courseFilter);
                  let filtered = q
                    ? pool.filter((s) =>
                        (s.name || '').toLowerCase().includes(q) ||
                        (s.regd || '').toLowerCase().includes(q) ||
                        (s.courseId || '').toLowerCase().includes(q) ||
                        (s.courseName || '').toLowerCase().includes(q)
                      )
                    : pool;
                  // sorting
                  filtered = [...filtered].sort((a,b)=>{
                    let av, bv;
                    if (sortKey === 'name') { av = (a.name||'').toLowerCase(); bv = (b.name||'').toLowerCase(); }
                    else if (sortKey === 'regd') { av = (a.regd||'').toLowerCase(); bv = (b.regd||'').toLowerCase(); }
                    else { av = (a.courseName||a.courseId||'').toLowerCase(); bv = (b.courseName||b.courseId||'').toLowerCase(); }
                    if (av < bv) return sortDir === 'asc' ? -1 : 1;
                    if (av > bv) return sortDir === 'asc' ? 1 : -1;
                    return 0;
                  });
                  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
                  const current = Math.min(studentPage, totalPages);
                  const start = (current - 1) * pageSize;
                  const paged = filtered.slice(start, start + pageSize);
                  return (
                    <>
                      <Grid container spacing={2}>
                        {paged.map((s, idx) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={`${s.regd}-${idx}`}>
                            <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2 }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{s.regd}</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2"><strong>{s.courseId}</strong> • {s.courseName}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Chip size="small" label="Active" color="success" />
                                <Button size="small" variant="text">View</Button>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Button size="small" disabled={current <= 1} onClick={() => setStudentPage((p) => Math.max(1, p - 1))}>Previous</Button>
                        <Typography variant="body2">Page {current} of {totalPages}</Typography>
                        <Button size="small" disabled={current >= totalPages} onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                      </Box>
                    </>
                  );
                })()}
              </>
            )}
          </Paper>
        </Grid>
        {/* Request Details Modal */}
        <Dialog open={reqOpen} onClose={() => setReqOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Request Details</DialogTitle>
          <DialogContent dividers>
            {reqIndex != null && filteredRequests[reqIndex] && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{filteredRequests[reqIndex].userId || 'Unknown Student'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{filteredRequests[reqIndex].createdAt ? new Date(filteredRequests[reqIndex].createdAt).toLocaleString() : ''}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2"><strong>Wants Change:</strong> {filteredRequests[reqIndex].wantsChange === 'yes' ? 'Yes' : 'No'}</Typography>
                {filteredRequests[reqIndex].wantsChange === 'yes' && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}><strong>Reason:</strong> {filteredRequests[reqIndex].reason || '-'}</Typography>
                    <Typography variant="body2"><strong>Preferred Course:</strong> {filteredRequests[reqIndex].newCourse || '-'}</Typography>
                  </>
                )}
                {filteredRequests[reqIndex].status && (
                  <Chip size="small" label={filteredRequests[reqIndex].status} sx={{ mt: 1 }} />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {reqIndex != null && filteredRequests[reqIndex] && !filteredRequests[reqIndex].status && (
              <>
                <Button onClick={() => { updateRequestStatus(reqIndex, 'approved'); setReqOpen(false); }}>Approve</Button>
                <Button onClick={() => { updateRequestStatus(reqIndex, 'denied'); setReqOpen(false); }} variant="outlined">Deny</Button>
              </>
            )}
            <Button onClick={() => setReqOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>
  );
};

export default FacultyDashboard;
