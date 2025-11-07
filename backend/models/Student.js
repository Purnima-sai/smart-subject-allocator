const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String },
  department: { type: String },
  year: { type: Number },
  semester: { type: Number },
  cgpa: { type: Number, default: 0 },
  preferences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  preferencesLocked: { type: Boolean, default: false },
  preferencesSubmittedAt: { type: Date },
  allocated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
