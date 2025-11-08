const csvParser = require('../utils/csvParser');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const path = require('path');
const Subject = require('../models/Subject');
const Allocation = require('../models/Allocation');
const reportGenerator = require('../utils/reportGenerator');
const archiver = require('archiver');
const fs = require('fs');

// Upload students CSV and create users+student docs
// expected CSV headers: name,rollNumber,email,department,year,cgpa
exports.uploadStudents = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fullPath = req.file.path;
    const rows = await csvParser.parseCSV(fullPath);
    const created = [];
    for (const row of rows) {
      const name = row.name || `${row.firstName || 'Student'}`;
      const email = row.email;
      if (!email) continue;
      const existing = await User.findOne({ email });
      if (existing) {
        // skip duplicates
        continue;
      }
  const password = (row.password) ? row.password : Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: 'student' });
      const student = await Student.create({
        user: user._id,
        rollNumber: row.rollNumber || '',
        department: row.department || '',
        year: row.year ? Number(row.year) : undefined,
        cgpa: row.cgpa ? Number(row.cgpa) : 0,
      });
      // attempt to email credentials (best-effort)
      try {
        const emailService = require('../utils/emailService');
        await emailService.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@example.com',
          to: user.email,
          subject: 'Your SSAEMS account',
          text: `Hello ${user.name},\nYour account has been created. Login: ${user.email}\nPassword: ${password}\nPlease change your password.`,
        });
      } catch (e) {
        // ignore email errors but log
        console.warn('Email send failed for', user.email, e.message || e);
      }
      created.push({ user: user.email, student: student._id });
    }
    res.json({ message: 'Students uploaded', createdCount: created.length, created });
  } catch (err) {
    next(err);
  }
};

// Subject CRUD
exports.createSubject = async (req, res, next) => {
  try {
    const { code, title, capacity, instructor } = req.body;
    const existing = await Subject.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Subject code exists' });
    const subject = await Subject.create({ code, title, capacity: capacity || 30, instructor });
    res.status(201).json({ subject });
  } catch (err) { next(err); }
};

exports.listSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().populate('instructor');
    res.json({ subjects });
  } catch (err) { next(err); }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const subject = await Subject.findByIdAndUpdate(id, update, { new: true });
    res.json({ subject });
  } catch (err) { next(err); }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Subject.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// Export allocations: generate subject-wise CSVs and zip them
exports.exportAllotments = async (req, res, next) => {
  try {
    // Fetch allocations and join with students & subjects
    const allocations = await Allocation.find().populate('student').populate('subject').lean();

    // Group by subject
    const map = new Map();
    for (const a of allocations) {
      const subj = a.subject || { _id: 'unknown', code: 'unknown' };
      const key = String(subj._id);
      if (!map.has(key)) map.set(key, { subject: subj, rows: [] });
      const student = a.student || {};
      map.get(key).rows.push({ studentId: student.rollNumber || '', name: (student.user && student.user.name) || '', cgpa: student.cgpa || '', priority: a.priority });
    }

    // create temp dir
    const outDir = path.join(__dirname, '..', 'data', `exports_${Date.now()}`);
    fs.mkdirSync(outDir, { recursive: true });

    const files = [];
    for (const [k, v] of map.entries()) {
      const filename = path.join(outDir, `${v.subject.code || k}.csv`);
      reportGenerator.generateAllocationCSV(v.rows, filename);
      files.push(filename);
    }

    // zip files
    const zipPath = path.join(outDir, 'allocations.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => {
      res.download(zipPath);
    });
    archive.pipe(output);
    for (const f of files) archive.file(f, { name: path.basename(f) });
    archive.finalize();

  } catch (err) { next(err); }
};
