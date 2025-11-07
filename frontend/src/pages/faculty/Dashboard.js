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

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'faculty') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

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

  // Placeholder faculty profile (no backend)
  const faculty = {
    name: 'Dr. Jane Smith',
    designation: 'Associate Professor',
    experience: 8,
    coursesTaught: 4,
    studentsAllocated: 0,
    courseIds: ['CS505', 'CS507'], // demo courses handled by this faculty
  };

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

  const seedAllottedIfMissing = () => {
    try {
      const raw = localStorage.getItem('ssaems_allotted_students');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    // Seed demo data (would be replaced by backend)
    const demo = [
      { name: 'John Doe', regd: 'STU2023001', courseId: 'CS505', courseName: 'Cybersecurity Basics' },
      { name: 'Alice Johnson', regd: 'STU2023013', courseId: 'CS507', courseName: 'IoT Systems' },
      { name: 'Ravi Kumar', regd: 'STU2023056', courseId: 'CS505', courseName: 'Cybersecurity Basics' },
    ];
    localStorage.setItem('ssaems_allotted_students', JSON.stringify(demo));
    return demo;
  };

  const loadData = React.useCallback(() => {
    const all = seedAllottedIfMissing();
    const forMe = all.filter((s) => faculty.courseIds.includes(s.courseId));
    setAllottedStudents(forMe);
    try {
      const rawReq = localStorage.getItem('ssaems_change_requests');
      const arr = rawReq ? JSON.parse(rawReq) : [];
      // Filter requests by preferred course to only show items relevant to faculty’s handled courses
      const filtered = arr.filter((r) => r.newCourse && faculty.courseIds.includes(r.newCourse));
      setRequests(filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    } catch (_) {
      setRequests([]);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const updateRequestStatus = (idx, status) => {
    const updated = requests.map((r, i) => (i === idx ? { ...r, status } : r));
    setRequests(updated);
    try {
      localStorage.setItem('ssaems_change_requests', JSON.stringify(updated));
    } catch (_) {}
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
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ fontWeight: 500 }}
        >
          Logout
        </Button>
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
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>Refresh</Button>
              <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => exportStudentsCsv(allottedStudents)}>Export CSV</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Student Requests (placed next to Allocation Overview) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Student Requests</Typography>
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
            {filteredRequests.length === 0 ? (
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
                        {!r.status && (
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
