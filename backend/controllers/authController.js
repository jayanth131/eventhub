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
    const { 
        username, 
        email, 
        password, 
        businessName, 
        category, 
        phone, 
        location, 
        roleRef 
    } = req.body; 

    try {
        // 1️⃣ Create User with role "vendor"
        const user = new User({ 
            username, 
            email, 
            password, 
            role: 'vendor', 
            roleRef 
        });

        await user.save();

        // 2️⃣ Create Vendor Profile with new approval fields
        const vendorProfile = await VendorProfile.create({
            userId: user._id,
            businessName,
            email,
            category,
            location,
            phone,

            // NEW FIELDS ADDED HERE
            approvalStatus: "pending",
            isApproved: false,

            // You may add default pricing fields later if needed
            // totalCost: req.body.totalCost || 0,
            // advancePaymentAmount: req.body.advancePaymentAmount || 5000
        });

        // 3️⃣ Link vendor profile to user account
        user.profileId = vendorProfile._id;
        await user.save();

        // 4️⃣ Return success with token
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

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // 🚨 CHECK: Vendor approval logic
        if (user.role === "vendor") {
            const vendorProfile = await VendorProfile.findById(user.profileId);

            if (!vendorProfile) {
                return res.status(400).json({ success: false, message: "Vendor profile not found" });
            }

            // Vendor not approved yet
            if (!vendorProfile.isApproved || vendorProfile.approvalStatus !== "approved") {
                return res.status(403).json({
                    success: false,
                    message: `Your vendor account is still ${vendorProfile.approvalStatus}. Please wait for admin approval.`
                });
            }
        }

        // If passed all checks → login success
        sendTokenResponse(user, 200, res);
        console.log("Login successful:", user.email);

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
