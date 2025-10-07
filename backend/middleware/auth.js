// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes, ensures user is logged in
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in headers (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route (No token)' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user (excluding password) to the request object
        req.user = await User.findById(decoded.id).select('-password');
        
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route (Invalid token)' });
    }
};

// Restricts access based on user role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};