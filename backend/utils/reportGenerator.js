// reportGenerator.js - produce simple CSV or Buffer reports for allocations
const { writeCSV } = require('./csvParser');
const path = require('path');

exports.generateAllocationCSV = async (allocations, outPath) => {
  // allocations: [{ student, subject, priority }]
  const rows = allocations.map(a => ({ student: String(a.student), subject: String(a.subject), priority: a.priority }));
  const target = outPath || path.join(__dirname, '..', 'data', `allocations_${Date.now()}.csv`);
  writeCSV(target, rows);
  return target;
};
