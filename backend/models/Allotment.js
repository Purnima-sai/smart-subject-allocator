const mongoose = require('mongoose');

const AllotmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  rank: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Allotment', AllotmentSchema);
