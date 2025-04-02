const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Get all users
router.get('/users', adminController.getAllUsers);

// Get user details
router.get('/users/:id', adminController.getUserDetails);

// Update user role
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;