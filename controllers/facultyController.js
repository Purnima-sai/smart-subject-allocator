const Faculty = require('../models/Faculty');
exports.listFaculty = async (req, res, next) => {
  try {
    const list = await Faculty.find();
    res.json({ list });
  } catch (err) {
    next(err);
  }
};

exports.approveRequest = async (req, res, next) => {
  // placeholder
  res.json({ message: 'approveRequest not implemented' });
};

// List subjects assigned to a faculty (if instructor field used)
exports.listMySubjects = async (req, res, next) => {
  try {
    const Subject = require('../models/Subject');
    const faculty = await Faculty.findOne({ email: req.user && req.user.email });
    const subjects = faculty ? await Subject.find({ instructor: faculty._id }) : [];
    res.json({ subjects });
  } catch (err) { next(err); }
};

exports.downloadSubjectAllocations = async (req, res, next) => {
  try {
    const Allocation = require('../models/Allocation');
    const Subject = require('../models/Subject');
    const subjectId = req.params.subjectId;
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const allocations = await Allocation.find({ subject: subjectId }).populate('student').lean();
    const rows = allocations.map(a => ({ rollNumber: a.student.rollNumber || '', name: (a.student.user && a.student.user.name) || '', cgpa: a.student.cgpa || '', priority: a.priority }));
    const filename = require('path').join(__dirname, '..', 'data', `${subject.code || subjectId}_allocations.csv`);
    const reportGenerator = require('../utils/reportGenerator');
    await reportGenerator.generateAllocationCSV(rows, filename);
    res.download(filename);
  } catch (err) { next(err); }
};
