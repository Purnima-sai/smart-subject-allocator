const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

const CSV_FILE_PATH = path.join(__dirname, '../../Generated_Student_Excel_Dataset.csv');
const OUTPUT_FAILURE_CSV = path.join(__dirname, '../../data', `failed_logins_${Date.now()}.csv`);
const LOGIN_URL = 'http://127.0.0.1:5000/api/auth/login';

async function run() {
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  if (!fs.existsSync(path.dirname(OUTPUT_FAILURE_CSV))) fs.mkdirSync(path.dirname(OUTPUT_FAILURE_CSV), { recursive: true });
  const out = fs.createWriteStream(OUTPUT_FAILURE_CSV, { flags: 'w' });
  out.write('Email,Password,Reason\n');

  console.log(`Attempting ${rows.length} logins and writing failures to ${OUTPUT_FAILURE_CSV}`);
  let success = 0; let fail = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const email = (r['Email'] || r['email'] || '').trim();
    const password = (r['Password'] || r['password'] || '').trim();
    if (!email || !password) {
      out.write(`"${email}","${password}","missing email/password"\n`);
      fail++;
      continue;
    }
    try {
      const resp = await axios.post(LOGIN_URL, { email, password }, { timeout: 5000 });
      if (resp && resp.data && resp.data.token) success++;
      else {
        fail++;
        out.write(`"${email}","${password}","no token in response"\n`);
      }
    } catch (err) {
      fail++;
      const reason = err.response && err.response.data && err.response.data.message ? err.response.data.message : (err.message || 'request failed');
      out.write(`"${email}","${password}","${reason.replace(/\"/g,'"')}"\n`);
    }
    if ((i+1) % 100 === 0) console.log(`Processed ${i+1} rows (success: ${success}, failed: ${fail})`);
  }

  out.end();
  console.log('\nDone.');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${fail}`);
  console.log(`Failures written to: ${OUTPUT_FAILURE_CSV}`);
}

run().catch(err => { console.error(err); process.exit(1); });
