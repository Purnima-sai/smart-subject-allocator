const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/me', authenticate, studentController.getProfile);
router.put('/preferences', authenticate, authorizeRoles('student'), studentController.updatePreferences);

// Allocation related
router.get('/allocation', authenticate, authorizeRoles('student'), studentController.getAllocationResult);
router.get('/allocation/slip', authenticate, authorizeRoles('student'), studentController.downloadConfirmationSlip);

module.exports = router;
