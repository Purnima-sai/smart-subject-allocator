const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  department: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
