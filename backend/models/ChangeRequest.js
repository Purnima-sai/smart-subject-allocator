const mongoose = require('mongoose');

// A request from a student to change their allocated subject to another subject.
// status: pending (default) | approved | denied
// decidedAt set when status transitions from pending.
const ChangeRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  currentSubject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  requestedSubject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  reason: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  decidedAt: { type: Date },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }, // optional: who processed
}, { timestamps: true });

module.exports = mongoose.model('ChangeRequest', ChangeRequestSchema);
