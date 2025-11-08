const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { authenticate } = require('../middleware/authMiddleware');

// List subjects filtered by query (year, semester, department)
router.get('/', authenticate, subjectController.list);

module.exports = router;