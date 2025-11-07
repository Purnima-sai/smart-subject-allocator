const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorizeRoles('admin'), facultyController.listFaculty);

// Change requests
router.get('/change-requests', authenticate, authorizeRoles('faculty','admin'), facultyController.listChangeRequests);
router.post('/approve', authenticate, authorizeRoles('faculty','admin'), facultyController.approveRequest);

// Faculty subjects and allocations
router.get('/my-subjects', authenticate, authorizeRoles('faculty'), facultyController.listMySubjects);
router.get('/subjects/:subjectId/allocations', authenticate, authorizeRoles('faculty','admin'), facultyController.downloadSubjectAllocations);
router.get('/allocations', authenticate, authorizeRoles('faculty','admin'), facultyController.listAllocations);

module.exports = router;
