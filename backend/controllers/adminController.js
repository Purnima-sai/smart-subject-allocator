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
    let { code, title, capacity, instructor, year, semester, department, credits, hours, description, topics, faculty } = req.body;
    if (year == null || semester == null) return res.status(400).json({ message: 'year and semester are required' });

    // Auto-generate a code if not provided. If generated code collides, retry until unique.
    if (!code || !String(code).trim()) {
      const base = (title || 'SUBJ').toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 12);
      let attempt = 0;
      let candidate;
      do {
        candidate = `${base}_${Math.random().toString(36).slice(-4).toUpperCase()}`;
        attempt += 1;
        // safety: avoid infinite loop
        if (attempt > 10) break;
      } while (await Subject.exists({ code: candidate }));
      code = candidate;
    } else {
      // if provided and collides, try to make it unique by appending random suffix
      if (await Subject.exists({ code })) {
        const base = String(code).toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 12);
        let attempt = 0;
        let candidate;
        do {
          candidate = `${base}_${Math.random().toString(36).slice(-4).toUpperCase()}`;
          attempt += 1;
          if (attempt > 10) break;
        } while (await Subject.exists({ code: candidate }));
        code = candidate;
      }
    }

    const created = await Subject.create({
      code,
      title,
      capacity: capacity || 30,
      instructor,
      year: Number(year),
      semester: Number(semester),
      department: department || undefined,
      credits: credits || 3,
      hours: hours || 3,
      description: description || '',
      topics: Array.isArray(topics) ? topics : [],
      faculty: faculty || '',
    });

  // fetch populated and ensure code is present in returned object
  const subject = await Subject.findById(created._id).populate('instructor', 'name email').lean();
  // in rare cases older documents or race conditions may leave code undefined in the returned object
  // ensure we always return a code string to the client (fallback to the generated code)
  if (!subject.code) subject.code = code;
  res.status(201).json({ subject });
  } catch (err) { next(err); }
};

// Backfill codes for existing subjects that don't have a code
exports.backfillSubjectCodes = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ $or: [{ code: { $exists: false } }, { code: null }, { code: '' }] });
    const updates = [];
    for (const s of subjects) {
      const base = (s.title || 'SUBJ').toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 12);
      let code = `${base}_${Math.random().toString(36).slice(-4).toUpperCase()}`;
      // ensure unique
      while (await Subject.findOne({ code })) {
        code = `${base}_${Math.random().toString(36).slice(-4).toUpperCase()}`;
      }
      s.code = code;
      await s.save();
      updates.push({ id: s._id, code });
    }
    res.json({ updated: updates.length, details: updates });
  } catch (err) { next(err); }
};

// Dangerous: clear all subjects (admin only) — useful for demos to start clean
exports.clearAllSubjects = async (req, res, next) => {
  try {
    await Subject.deleteMany({});
    res.json({ message: 'All subjects cleared' });
  } catch (err) { next(err); }
};

exports.listSubjects = async (req, res, next) => {
  try {
    const { year, semester } = req.query;
    const criteria = {};
    if (year != null) criteria.year = Number(year);
    if (semester != null) criteria.semester = Number(semester);
    const subjects = await Subject.find(criteria).populate('instructor').lean();
    res.json({ subjects });
  } catch (err) { next(err); }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, capacity, year, semester, department, credits, hours, description, topics, faculty } = req.body;
    const update = {
      title,
      capacity,
      year: year != null ? Number(year) : undefined,
      semester: semester != null ? Number(semester) : undefined,
      department,
      credits,
      hours,
      description,
      topics: Array.isArray(topics) ? topics : undefined,
      faculty,
    };
    // Remove undefined values
    Object.keys(update).forEach(key => update[key] === undefined && delete update[key]);
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

// Seed default subjects if collection empty
exports.seedDefaults = async (req, res, next) => {
  try {
    const count = await Subject.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Subjects already exist' });
    const sample = [
      { code: 'JAVA_Y2S1', title: 'Java Programming', capacity: 40, year: 2, semester: 1 },
      { code: 'DBMS_Y2S1', title: 'Database Systems', capacity: 35, year: 2, semester: 1 },
      { code: 'ML_Y3S2', title: 'Intro to Machine Learning', capacity: 30, year: 3, semester: 2 },
      { code: 'AI_Y3S2', title: 'Artificial Intelligence', capacity: 30, year: 3, semester: 2 },
      { code: 'NET_Y4S1', title: 'Computer Networks', capacity: 30, year: 4, semester: 1 },
    ];
    const inserted = await Subject.insertMany(sample);
    res.json({ message: 'Seeded', subjects: inserted });
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

// Get all students with their registered preferences
exports.getRegisteredElectives = async (req, res, next) => {
  try {
    console.log('=== FETCHING REGISTERED ELECTIVES ===');
    // Fetch all students who have submitted preferences
    const students = await Student.find({ preferences: { $exists: true, $ne: [] } })
      .populate('user', 'name email')
      .populate('preferences', 'code title year semester')
      .lean();

    console.log(`Found ${students.length} students with preferences`);

    const registrations = students.map(student => ({
      studentId: student._id,
      rollNumber: student.rollNumber,
      name: student.user?.name || 'N/A',
      email: student.user?.email || 'N/A',
      department: student.department,
      year: student.year,
      semester: student.semester,
      cgpa: student.cgpa,
      preferencesLocked: student.preferencesLocked || false,
      submittedAt: student.preferencesSubmittedAt,
      preferences: (student.preferences || []).map((pref, index) => ({
        priority: index + 1,
        subjectId: pref._id,
        code: pref.code,
        title: pref.title,
        year: pref.year,
        semester: pref.semester
      }))
    }));

    const lockedCount = registrations.filter(r => r.preferencesLocked).length;
    console.log(`Locked: ${lockedCount}, Draft: ${registrations.length - lockedCount}`);
    console.log('=== FETCH COMPLETE ===\n');

    res.json({ 
      registrations,
      totalCount: registrations.length,
      lockedCount: lockedCount,
      message: `${registrations.length} students have registered their preferences`
    });
  } catch (err) { 
    console.error('Error fetching registered electives:', err);
    next(err); 
  }
};
