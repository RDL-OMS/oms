const User = require('../models/user');
const Project = require('../models/Project');

// Get all users (only for owners)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if requester is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can access this resource'
      });
    }

    const users = await User.find({}, '-password -__v').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user role (only for owners)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if requester is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can modify user roles'
      });
    }

    // Validate role
    if (!['owner', 'teamlead', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Prevent modifying yourself (optional)
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own role'
      });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If changing from teamlead to another role, remove from managed projects
    if (user.role === 'teamlead' && role !== 'teamlead') {
      await Project.updateMany(
        { teamLead: id },
        { $unset: { teamLead: "" } }
      );
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user details (admin view)
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can access this resource'
      });
    }

    const user = await User.findById(id)
      .select('-password -__v')
      .populate('projects managedProjects', 'name projectId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};