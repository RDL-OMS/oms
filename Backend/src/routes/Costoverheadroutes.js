const express = require('express');
const router = express.Router();
const costOverheadController = require('../controllers/costOverheadController');

// Get all overheads for a project
router.get('/get/:projectId', costOverheadController.getOverheads);

// Create new overhead
router.post('/new', costOverheadController.createOverhead);

// Update overhead
router.put('/update/:id', costOverheadController.updateOverhead);

// Delete overhead
router.delete('/delete/:id', costOverheadController.deleteOverhead);

// Add subhead
router.post('/:id/subheads', costOverheadController.addSubhead);

module.exports = router;