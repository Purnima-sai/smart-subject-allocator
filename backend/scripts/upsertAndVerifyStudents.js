const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const User = require('../models/User');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';
const CSV_FILE_PATH = path.join(__dirname, '../../Generated_Student_Excel_Dataset.csv');
const LOGIN_URL = 'http://127.0.0.1:5000/api/auth/login';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Read CSV and build map of email -> last seen row
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  const map = new Map();
  for (const r of rows) {
    const email = (r['Email'] || r['email'] || '').trim();
    if (!email) continue;
    map.set(email, r); // last one wins
  }

  console.log(`Found ${rows.length} rows, ${map.size} unique emails. Upserting each user...`);

  let created = 0, updated = 0;
  for (const [email, r] of map.entries()) {
    const name = (r['Name'] || r['name'] || '').trim() || 'Student';
    const password = (r['Password'] || r['password'] || '').trim() || Math.random().toString(36).slice(-8);
    const regNo = (r['Reg No'] || r['RegNo'] || r['Reg_Number'] || r['rollNumber'] || '').trim();
    const year = parseInt(r['Year'] || r['year']) || undefined;
    const semester = parseInt(r['Semester'] || r['semester']) || undefined;
    const cgpa = parseFloat(r['CGPA'] || r['cgpa']) || 0;

    const hashed = await bcrypt.hash(password, 10);
    // Upsert user
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { name, email, password: hashed, role: 'student' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Upsert student doc linked to user
    const studentUpdate = {
      user: user._id,
      rollNumber: regNo || undefined,
      year: year || undefined,
      semester: semester || undefined,
      cgpa: cgpa || 0,
      department: (r['department'] || r['Department'] || 'CSE')
    };
    await Student.findOneAndUpdate(
      { user: user._id },
      { $set: studentUpdate },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Track creation vs update: we can check createdAt
    if (user.createdAt && (Date.now() - user.createdAt.getTime()) < 60000) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`Upsert complete. created:${created} updated:${updated}`);

  // Now verify login for each unique email using the selected password (last seen)
  console.log('Verifying login for each unique email via auth endpoint...');
  let success = 0, fail = 0;
  for (const [email, r] of map.entries()) {
    const password = (r['Password'] || r['password'] || '').trim() || '';
    try {
      const resp = await axios.post(LOGIN_URL, { email, password }, { timeout: 5000 });
      if (resp?.data?.token) success++; else { fail++; }
    } catch (err) {
      // If login failed with provided password, try with fallback: the hashed password we set (can't retrieve plaintext), so try nothing
      fail++;
    }
  }

  console.log(`Verification complete. success:${success} fail:${fail} (total ${map.size})`);
  await mongoose.connection.close();
}

run().catch(err => { console.error(err); process.exit(1); });
