const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// Verify Token
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({
        error: 'Access denied. No token provided.'
    });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({
            error: 'Invalid token.'
        });
    }
};

// Admin Check
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. Admins only.'
        });
    }
    next();
};

module.exports = { authenticate, isAdmin, JWT_SECRET };