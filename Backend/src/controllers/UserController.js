const User = require('../models/user');
const { generatePasswordHash } = require('../utils/auth');
const { sendWelcomeEmail } = require('../utils/email');

// Get all users (only for owners)
exports.getAllUsers = async (req, res) => {
  try {
    // Only owners can access this endpoint
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can access user data'
      });
    }

    const users = await User.find({})
      .select('-password -__v') // Exclude sensitive fields
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single user profile
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're owners
    if (req.user.role !== 'owner' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    const user = await User.findById(id)
      .select('-password -__v') // Exclude sensitive fields
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// // Create new user (only for owners)
// exports.createUser = async (req, res) => {
//   try {
//     // Only owners can create users
//     if (req.user.role !== 'owner') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only owners can create users'
//       });
//     }

//     const { name, email, role } = req.body;

//     // Basic validation
//     if (!name || !email || !role) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name, email and role are required'
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     // Generate temporary password
//     const tempPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = await generatePasswordHash(tempPassword);

//     // Create user
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       createdBy: req.user.id
//     });

//     // Send welcome email (async - don't await)
//     sendWelcomeEmail(email, name, tempPassword).catch(console.error);

//     // Return response without sensitive data
//     const userResponse = newUser.toObject();
//     delete userResponse.password;
//     delete userResponse.__v;

//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       data: userResponse
//     });

//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// Create new user (only for owners)
exports.createUser = async (req, res) => {
  try {
    // Only owners can create users
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can create users'
      });
    }

    const { username, name, email, password, role, employeeId } = req.body;

    // Basic validation
    if (!username || !name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Username, name, email, password and role are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists by email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash the password
    const hashedPassword = await generatePasswordHash(password);

    // Create user with or without provided employeeId
    const userData = {
      username,
      name,
      email,
      password: hashedPassword,
      role,
      createdBy: req.user.id
    };

    // Only add employeeId if it was provided
    if (employeeId && employeeId.trim() !== '') {
      userData.employeeId = employeeId;
    }
    console.log("userdaata",userData);
    

    const newUser = await User.create(userData);

    // Return response without sensitive data
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// Update user role (only for owners)
exports.updateUserRole = async (req, res) => {
  try {
    // Only owners can update roles
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can update user roles'
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['owner', 'teamlead', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Prevent changing own role
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile (users can update their own profile)
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar } = req.body;

    // Users can only update their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, avatar },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user (only for owners)
exports.deleteUser = async (req, res) => {
  try {
    // Only owners can delete users
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can delete users'
      });
    }

    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};