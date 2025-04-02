const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply auth middleware to all user routes
router.use(authMiddleware);

// Get all users (owners only)
router.get('/', userController.getAllUsers);

// Get single user
router.get('/:id', userController.getUserById);

// Create new user (owners only)
router.post('/', userController.createUser);

// Update user role (owners only)
router.put('/:id/role', userController.updateUserRole);

// Update user profile
router.put('/:id/profile', userController.updateUserProfile);

// Delete user (owners only)
router.delete('/:id', userController.deleteUser);

module.exports = router;