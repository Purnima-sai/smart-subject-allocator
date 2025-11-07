const axios = require('axios');
const { execSync } = require('child_process');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function run() {
  try {
    console.log('Ensuring test student exists...');
    try {
      execSync('node scripts/createTestStudent.js student1@example.com student123 2 1', { stdio: 'inherit' });
    } catch (e) {
      // continue even if script printed exists
    }

    console.log('Logging in as admin...');
    const adminLogin = await axios.post(BASE + '/api/auth/login', { email: 'admin@example.com', password: 'admin123' });
    const adminToken = adminLogin.data.token;
    console.log('Admin token received (len):', adminToken ? adminToken.length : 0);

    console.log('Creating subject as admin...');
    const subjBody = {
      title: 'VERIFY_SUBJECT_JS',
      year: 2,
      semester: 1,
      capacity: 20,
      credits: 3,
      hours: 3,
      description: 'Created by verify_flow.js',
      topics: ['t1','t2'],
      faculty: 'Verifier'
    };
    const created = await axios.post(BASE + '/api/admin/subjects', subjBody, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('Created subject id:', created.data.subject._id);

    console.log('Logging in as student...');
    const stuLogin = await axios.post(BASE + '/api/auth/login', { email: 'student1@example.com', password: 'student123' });
    const stuToken = stuLogin.data.token;
    console.log('Student token received (len):', stuToken ? stuToken.length : 0);

    console.log('Fetching subjects for year=2 sem=1 as student...');
    const list = await axios.get(BASE + '/api/subjects?year=2&semester=1', { headers: { Authorization: `Bearer ${stuToken}` } });
    console.log('Subjects returned:', (list.data.subjects || []).map(s => ({ id: s._id, title: s.title, code: s.code })).slice(0,50));

    const found = (list.data.subjects || []).some(s => s.title === subjBody.title || s.code === (created.data.subject && created.data.subject.code));
    if (found) {
      console.log('SUCCESS: Created subject is visible to student for year=2 sem=1');
      process.exit(0);
    } else {
      console.error('FAIL: Created subject not found in student subject list');
      process.exit(2);
    }
  } catch (err) {
    console.error('Error during verification flow:', err.response ? err.response.data || err.response.statusText : err.message);
    process.exit(1);
  }
}

run();
