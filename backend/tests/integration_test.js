const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');

// Validate MongoDB connection first
async function validateMongo() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ssaems';
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    await conn.connection.db.admin().ping();
    console.log('MongoDB connection validated');
    await mongoose.disconnect();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

const base = 'http://localhost:5000';

async function run() {
  // Validate MongoDB connection first
  await validateMongo();
  try {
    console.log('1) Login as admin');
    let res = await axios.post(base + '/api/auth/login', { email: process.env.ADMIN_EMAIL || 'admin@example.com', password: 'admin123' });
    const adminToken = res.data.token;
    console.log(' admin token length:', (adminToken || '').length);

    console.log('\n2) List subjects (admin)');
    res = await axios.get(base + '/api/admin/subjects', { headers: { Authorization: `Bearer ${adminToken}` } });
    const subjects = res.data.subjects;
    console.log(' subjects count:', subjects.length);

    // create two test students via signup
    console.log('\n3) Create test students');
      try {
        await axios.post(base + '/api/auth/signup', { name: 'Test Student A', email: 'studA@example.com', password: 'pwdA123', role: 'student' });
        await axios.post(base + '/api/auth/signup', { name: 'Test Student B', email: 'studB@example.com', password: 'pwdB123', role: 'student' });
        console.log(' created students');
      } catch (err) {
        if (err.response && err.response.status === 400 && err.response.data.message === 'Email already registered') {
          console.log(' using existing test students');
        } else {
          throw err;
        }
      }

    console.log('\n4) Login students');
    res = await axios.post(base + '/api/auth/login', { email: 'studA@example.com', password: 'pwdA123' });
    const tokenA = res.data.token;
    res = await axios.post(base + '/api/auth/login', { email: 'studB@example.com', password: 'pwdB123' });
    const tokenB = res.data.token;
    console.log(' student tokens:', tokenA.length, tokenB.length);

    // pick two subject IDs
    const subj1 = subjects[0] && subjects[0]._id;
    const subj2 = subjects[1] && subjects[1]._id;
    if (!subj1) throw new Error('No subjects seeded');

    console.log('\n5) Submit preferences for students (max 5)');
    await axios.put(base + '/api/students/preferences', { preferences: [subj1, subj2].filter(Boolean) }, { headers: { Authorization: `Bearer ${tokenA}` } });
    await axios.put(base + '/api/students/preferences', { preferences: [subj1].filter(Boolean) }, { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log(' preferences submitted');

    console.log('\n6) Run allocation (admin)');
    res = await axios.post(base + '/api/allocation/run', {}, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log(' allocation response:', res.data.message, 'allocated count:', res.data.allocations, 'waitlists keys:', Object.keys(res.data.waitlists || {}).length);

    console.log('\n7) Check student allocations and download confirmation slips');
    res = await axios.get(base + '/api/students/allocation', { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log(' student A allocation:', res.data);
    // download slip
    const slipRes = await axios.get(base + '/api/students/allocation/slip', { headers: { Authorization: `Bearer ${tokenA}` }, responseType: 'arraybuffer' });
    const slipPath = 'tests/confirmation_studA.pdf';
    fs.writeFileSync(slipPath, slipRes.data);
    console.log(' saved slip to', slipPath);

    console.log('\n8) List allocation snapshots (admin)');
    res = await axios.get(base + '/api/allocation/snapshots', { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log(' snapshots count:', res.data.snapshots.length);

    console.log('\n9) Export allotments (admin) - download zip');
    const exportRes = await axios.get(base + '/api/admin/export-allotments', { headers: { Authorization: `Bearer ${adminToken}` }, responseType: 'arraybuffer' });
    const zipPath = 'tests/allocations_export.zip';
    fs.writeFileSync(zipPath, exportRes.data);
    console.log(' saved export to', zipPath);

    console.log('\n10) Rollback allocations (admin)');
    res = await axios.post(base + '/api/allocation/rollback', {}, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log(' rollback response:', res.data.message);

    console.log('\nIntegration test completed successfully');
    process.exit(0);
  } catch (err) {
      console.error('Integration test failed:', err.message);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', JSON.stringify(err.response.data, null, 2));
      }
      console.error('Stack trace:', err.stack);
    process.exit(1);
  }
}

run();
