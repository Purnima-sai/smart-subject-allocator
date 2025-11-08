const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

const CSV_FILE_PATH = path.join(__dirname, '../../Generated_Student_Excel_Dataset.csv');
const LOGIN_URL = 'http://127.0.0.1:5000/api/auth/login';

async function verify() {
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Read ${rows.length} rows from CSV`);
  let success = 0;
  let fail = 0;
  const failures = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const email = (r['Email'] || r['email'] || '').trim();
    const password = (r['Password'] || r['password'] || '').trim();
    if (!email || !password) {
      failures.push({ email: email || '(missing)', reason: 'missing email/password' });
      fail++;
      continue;
    }
    try {
      const resp = await axios.post(LOGIN_URL, { email, password }, { timeout: 5000 });
      if (resp && resp.data && resp.data.token) {
        success++;
      } else {
        fail++;
        failures.push({ email, reason: 'no token in response' });
      }
    } catch (err) {
      fail++;
      let reason = err.response && err.response.data && err.response.data.message ? err.response.data.message : (err.message || 'request failed');
      failures.push({ email, reason });
    }
    if ((i+1) % 100 === 0) console.log(`Attempted ${i+1} logins (${success} OK, ${fail} failed)`);
  }

  console.log('\nVerification complete');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${fail}`);
  if (failures.length) {
    console.log('\nSample failures (first 20):');
    console.log(failures.slice(0,20));
  }
}

verify().catch(err => { console.error('Fatal error', err); process.exit(1); });
