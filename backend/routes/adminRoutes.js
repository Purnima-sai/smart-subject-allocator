const express = require('express');

const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

// student CSV upload (admin only)
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
router.post('/upload-students', authenticate, authorizeRoles('admin'), upload.single('file'), adminController.uploadStudents);

// Subject CRUD (admin only)
router.post('/subjects', authenticate, authorizeRoles('admin'), adminController.createSubject);
router.get('/subjects', authenticate, authorizeRoles('admin'), adminController.listSubjects);
router.put('/subjects/:id', authenticate, authorizeRoles('admin'), adminController.updateSubject);
router.delete('/subjects/:id', authenticate, authorizeRoles('admin'), adminController.deleteSubject);
// seed sample subjects (admin only)
router.post('/subjects/seed', authenticate, authorizeRoles('admin'), adminController.seedDefaults);
// admin utilities
router.post('/subjects/backfill-codes', authenticate, authorizeRoles('admin'), adminController.backfillSubjectCodes);
router.delete('/subjects', authenticate, authorizeRoles('admin'), adminController.clearAllSubjects);

// exports (admin only)
router.get('/export-allotments', authenticate, authorizeRoles('admin'), adminController.exportAllotments);

// get registered student preferences (admin only)
router.get('/registered-electives', authenticate, authorizeRoles('admin'), adminController.getRegisteredElectives);

module.exports = router;
