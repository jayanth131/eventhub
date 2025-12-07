// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes (Admin, Customer, Vendor)
exports.protect = async (req, res, next) => {
    let token;

    // 1️⃣ First check normal user token
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ If not found → check admin token
    if (!token && req.headers.admintoken) {
        token = req.headers.admintoken;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = await User.findById(decoded.id).select("-password");
        next();

    } catch (err) {
        console.error("TOKEN VERIFICATION ERROR:", err.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};


// Role-based restriction (Admin, Vendor, Customer)
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user injected by protect()
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized for this route`,
      });
    }
    next();
  };
};
