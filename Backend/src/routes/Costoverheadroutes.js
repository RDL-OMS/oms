const express = require('express');
const router = express.Router();
const costOverheadController = require('../controllers/costOverheadController');
const auditLog = require('../middleware/auditLog')
const auth = require('../middleware/authMiddleware')

// Get all overheads for a project
router.get('/get/:projectId', costOverheadController.getOverheads);

// Create new overhead
router.post('/new',auditLog("CREATE","Overhead"), costOverheadController.createOverhead);

// Update overhead
router.put('/update/:id', costOverheadController.updateOverhead);

// Delete overhead
router.delete('/delete/:id',auditLog("DELETE","Overhead"), costOverheadController.deleteOverhead);

// Add subhead
router.post('/:id/subheads', costOverheadController.addSubhead);

router.delete('/:id/subheads',costOverheadController.deleteSubhead)

module.exports = router;