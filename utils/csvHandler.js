// Deprecated wrapper. Use ./csvParser.js instead. This file re-exports csvParser for backward compatibility.
const csvParser = require('./csvParser');

exports.parseCSV = csvParser.parseCSV;
exports.writeCSV = csvParser.writeCSV;

