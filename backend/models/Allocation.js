const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  priority: { type: Number },
  // optional: section assigned (index or id)
  section: { type: String },
  assignedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Allocation', AllocationSchema);
