const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  fromSubject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  toSubject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
