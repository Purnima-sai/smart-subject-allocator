const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorizeRoles('admin'), facultyController.listFaculty);
router.post('/approve', authenticate, authorizeRoles('faculty','admin'), facultyController.approveRequest);

router.get('/my-subjects', authenticate, authorizeRoles('faculty'), facultyController.listMySubjects);
router.get('/subjects/:subjectId/allocations', authenticate, authorizeRoles('faculty','admin'), facultyController.downloadSubjectAllocations);

module.exports = router;
