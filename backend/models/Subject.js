const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  capacity: { type: Number, default: 30 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  // sections: optional array of sections with independent capacities
  sections: [{ name: String, capacity: Number }],
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
