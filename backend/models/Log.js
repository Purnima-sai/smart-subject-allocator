const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  level: { type: String, enum: ['info','warn','error'], default: 'info' },
  message: { type: String, required: true },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);
