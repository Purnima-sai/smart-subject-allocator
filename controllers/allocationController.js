// Allocation controller: runs allocation algorithm and persists Allocation docs
const Allocation = require('../models/Allocation');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { greedyAllocate } = require('../utils/allocationAlgorithm');
const { multiRoundAllocate } = require('../utils/multiRoundAllocation');
const reportGenerator = require('../utils/reportGenerator');

exports.runAllocation = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');

    // Fetch subjects (with sections) and capacities
    const subjects = await Subject.find().lean();

    // Fetch students with preferences and CGPA, only those with preferences
    const students = await Student.find({ preferences: { $exists: true, $ne: [] } })
      .populate('preferences')
      .populate('user')
      .lean();

    // Sort by CGPA desc (merit)
    students.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));

    if (!students.length) {
      return res.json({ message: 'No students with preferences found', allocations: 0, waitlists: {} });
    }

    if (!subjects.length) {
      return res.status(400).json({ message: 'No subjects found in database' });
    }

    // Prepare students for allocator: convert populated preferences to ID strings
    const allocatorStudents = students.map(s => ({
      _id: s._id,
      preferences: Array.isArray(s.preferences) ? s.preferences.map(p => String(p._id || p)) : [],
      cgpa: s.cgpa || 0,
      user: s.user || null,
    }));

    // Run allocation: use multi-round allocator which returns allocations and waitlists
    const { allocations: allocResults, waitlists } = multiRoundAllocate(allocatorStudents, subjects, 5);

    if (!allocResults || !Array.isArray(allocResults)) {
      throw new Error('Allocation algorithm returned invalid result');
    }

    // Save snapshot of previous allocations (for rollback history)
    const AllocationSnapshot = require('../models/AllocationSnapshot');
    const prevAllocs = await Allocation.find().lean();
    if (prevAllocs && prevAllocs.length > 0) {
      await AllocationSnapshot.create({
        createdBy: req.user && req.user.id,
        note: 'pre-run snapshot',
        allocations: prevAllocs.map(p => ({
          student: p.student,
          subject: p.subject,
          priority: p.priority,
          section: p.section
        }))
      });
    }

    // Clear previous allocations
    await Allocation.deleteMany({});

    // Prepare allocation documents
    const docs = allocResults.map(a => ({
      student: new mongoose.Types.ObjectId(String(a.student)),
      subject: new mongoose.Types.ObjectId(String(a.subject)),
      priority: a.priority,
      section: a.section
    }));

    // Persist new allocations
    const created = await Allocation.insertMany(docs);

    // Update student documents to mark as allocated
    const studentIds = created.map(c => c.student);
    if (studentIds.length) {
      await Student.updateMany({ _id: { $in: studentIds } }, { $set: { allocated: true } });
    }

    // generate CSV report
    const reportPath = await reportGenerator.generateAllocationCSV(created);

    // send notifications to allocated students (best-effort)
    try {
      const emailService = require('../utils/emailService');
      for (const c of created) {
        const stud = students.find(s => String(s._id) === String(c.student));
        if (stud && stud.user && stud.user.email) {
          await emailService.sendAllocationNotification(stud.user.email, stud.user.name || '', c);
        }
      }
    } catch (e) {
      console.warn('Allocation notification errors', e.message || e);
    }

    res.json({ message: 'Allocation completed', allocations: created.length, report: reportPath, waitlists });
  } catch (err) {
    next(err);
  }
};

// Admin-only: rollback allocations (clear Allocation collection and reset students)
exports.rollbackAllocations = async (req, res, next) => {
  try {
    await Allocation.deleteMany({});
    await Student.updateMany({}, { $set: { allocated: false } });
    res.json({ message: 'Allocations rolled back' });
  } catch (err) { next(err); }
};

// List snapshots
exports.listSnapshots = async (req, res, next) => {
  try {
    const AllocationSnapshot = require('../models/AllocationSnapshot');
    const snaps = await AllocationSnapshot.find().sort({ createdAt: -1 }).lean();
    res.json({ snapshots: snaps });
  } catch (err) { next(err); }
};

// Rollback to a specific snapshot (admin only)
exports.rollbackToSnapshot = async (req, res, next) => {
  try {
    const AllocationSnapshot = require('../models/AllocationSnapshot');
    const id = req.params.snapshotId;
    const snap = await AllocationSnapshot.findById(id).lean();
    if (!snap) return res.status(404).json({ message: 'Snapshot not found' });
    // Clear current allocations
    await Allocation.deleteMany({});
    // Restore allocations from snapshot
    const toInsert = snap.allocations.map(a => ({ student: a.student, subject: a.subject, priority: a.priority, section: a.section }));
    await Allocation.insertMany(toInsert);
    // mark students
    const studentIds = toInsert.map(a => a.student);
    await Student.updateMany({}, { $set: { allocated: false } });
    await Student.updateMany({ _id: { $in: studentIds } }, { $set: { allocated: true } });
    res.json({ message: 'Rolled back to snapshot', snapshotId: id });
  } catch (err) { next(err); }
};
