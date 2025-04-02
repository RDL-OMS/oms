const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate password hash
exports.generatePasswordHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Verify password
exports.verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Verify JWT token
exports.verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};