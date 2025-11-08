const fs = require('fs');
const csv = require('csv-parser');

exports.parseCSV = (filePath) => new Promise((resolve, reject) => {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => resolve(results))
    .on('error', reject);
});

exports.writeCSV = (filePath, rows) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]).join(',') + '\n';
  const lines = rows.map(r => Object.values(r).join(',')).join('\n');
  fs.writeFileSync(filePath, headers + lines);
};
