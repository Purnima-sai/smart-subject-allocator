const mongoose = require('mongoose');

const AllocationSnapshotSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
  allocations: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    priority: { type: Number },
    section: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('AllocationSnapshot', AllocationSnapshotSchema);
