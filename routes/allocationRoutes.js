const express = require('express');
const router = require('express').Router();
const allocationController = require('../controllers/allocationController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Run allocation (admin only)
router.post('/run', authenticate, authorizeRoles('admin'), allocationController.runAllocation);

// Rollback allocations (admin only)
router.post('/rollback', authenticate, authorizeRoles('admin'), allocationController.rollbackAllocations);

// snapshots
router.get('/snapshots', authenticate, authorizeRoles('admin'), allocationController.listSnapshots);
router.post('/rollback/:snapshotId', authenticate, authorizeRoles('admin'), allocationController.rollbackToSnapshot);

module.exports = router;
