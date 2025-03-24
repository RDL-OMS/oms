const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    try {
        // Verify token logic (example only, integrate JWT properly)
        req.user = { id: '123', role: 'admin' }; 
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
