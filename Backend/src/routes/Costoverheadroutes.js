const express = require('express');
const router = express.Router();
const costOverheadController = require('../controllers/costOverheadController');

// Get all overheads for a project
router.get('/get/:projectId', costOverheadController.getOverheads);

// Create new overhead
router.post('/new', costOverheadController.createOverhead);

// Update overhead
router.put('/overheads/add/:id', costOverheadController.updateOverhead);

// Delete overhead
router.delete('/overheads/:id', costOverheadController.deleteOverhead);

// Add subhead
router.post('/overheads/:id/subheads', costOverheadController.addSubhead);

module.exports = router;