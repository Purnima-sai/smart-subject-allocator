const Subject = require('../models/Subject');

// GET /api/subjects?year=&semester=&department=
// Accessible to any authenticated user (student/faculty/admin)
exports.list = async (req, res, next) => {
  try {
    const { year, semester, department } = req.query;
    const criteria = {};
    if (year != null) criteria.year = Number(year);
    if (semester != null) criteria.semester = Number(semester);
    if (department) criteria.department = department;
    const subjects = await Subject.find(criteria).populate('instructor', 'name email').lean();
    res.json({ subjects });
  } catch (err) { next(err); }
};
