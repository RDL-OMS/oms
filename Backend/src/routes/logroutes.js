const express = require('express');
const router = express.Router();
const LogController = require('../controllers/LogControllers');

// Get all audit logs with filters
router.post('/', LogController.getLogs);

module.exports = router;