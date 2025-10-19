// controllers/authController.js

const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const VendorProfile = require('../models/VendorProfile');
const { profile } = require('console');
// Don't forget to import any necessary helper functions/constants here if needed

// Helper function to send JWT token response (Unchanged)
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res
        .status(statusCode)
        .json({
            success: true,
            token,
            role: user.role,
            userId: user._id
        });
};


// @desc    Register a Customer
// @route   POST /api/auth/signup/customer
// @access  Public
exports.registerCustomer = async (req, res, next) => {
    // Destructure required fields including the critical 'roleRef'
    const { username, email, password, name, phone, location, roleRef } = req.body; 

    try {
        // 1. Create a new User instance (triggers pre('save') hook for hashing)
        const user = new User({ username, email, password, role: 'customer', roleRef });
        await user.save(); // <-- CRITICAL: Saves user and hashes password

        // 2. Create the Customer Profile
        const customerProfile = await CustomerProfile.create({
            userId: user._id,
            name,
            phone,
            location
        });

        // 3. Link the profile ID back
        user.profileId = customerProfile._id;
        await user.save(); // Save again to update the profileId link

        sendTokenResponse(user, 201, res);

    } catch (error) {
        console.error("Customer Registration Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};


// @desc    Register a Vendor
// @route   POST /api/auth/signup/vendor
// @access  Public
exports.registerVendor = async (req, res, next) => {
    const { username, email, password, businessName, category,phone, location, roleRef } = req.body; 

    try {
        const user = new User({ username, email, password, role: 'vendor', roleRef });
        await user.save(); // Saves user and hashes password

        // 2. Create the Vendor Profile (Updated to reflect new fields)
        const vendorProfile = await VendorProfile.create({
            userId: user._id,
            businessName,
            email,
            category,
            location,
            phone, // New required field
            // New fields will default to 0 and 5000 if not provided in signup payload.
            // If you wanted to set initial values:
            // totalCost: req.body.totalCost || 0,
            // advancePaymentAmount: req.body.advancePaymentAmount || 5000 
            // We trust the schema defaults for simplicity here.
        });

        // 3. Link the profile ID back
        user.profileId = vendorProfile._id;
        await user.save(); 

        sendTokenResponse(user, 201, res);

    } catch (error) {
        console.error("Vendor Registration Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Login User/Vendor
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    try {
        // Find user by email, explicitly selecting the password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials (User not found)' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials (Password mismatch)' });
        }

        sendTokenResponse(user, 200, res);
        console.log("Login successful for user:", user);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });     
    }
};