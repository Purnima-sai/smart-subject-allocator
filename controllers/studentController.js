const Student = require('../models/Student');

exports.getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('user');
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    if (!Array.isArray(preferences)) return res.status(400).json({ message: 'Preferences should be an array' });
    if (preferences.length > 5) return res.status(400).json({ message: 'Max 5 preferences allowed' });
    // optionally validate subject ids exist
    const Subject = require('../models/Subject');
    const valid = await Subject.countDocuments({ _id: { $in: preferences } });
    if (valid !== preferences.length) return res.status(400).json({ message: 'One or more subject IDs invalid' });
    const student = await Student.findOneAndUpdate({ user: req.user.id }, { preferences }, { new: true, upsert: true });
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

exports.getAllocationResult = async (req, res, next) => {
  try {
    const Allocation = require('../models/Allocation');
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const alloc = await Allocation.findOne({ student: student._id }).populate('subject').lean();
    if (!alloc) return res.json({ allocated: false });
    res.json({ allocated: true, allocation: alloc });
  } catch (err) { next(err); }
};

exports.downloadConfirmationSlip = async (req, res, next) => {
  try {
    const Allocation = require('../models/Allocation');
    const student = await Student.findOne({ user: req.user.id }).populate('user');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const alloc = await Allocation.findOne({ student: student._id }).populate('subject').lean();
    if (!alloc) return res.status(404).json({ message: 'No allocation found' });
    const pdfGen = require('../utils/pdfGenerator');
    const buffer = await pdfGen.generateConfirmationSlip(student, alloc);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=confirmation_${student.rollNumber || student._id}.pdf`);
    res.send(buffer);
  } catch (err) { next(err); }
};
