// controllers/userController.js (MODIFIED SECTION)

// ... existing code ...

// @desc    Get current logged-in user's details and profile name
// @route   GET /api/users/me
// @access  Private
const User = require('../models/User'); 

exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("email role profileId roleRef username")
            .populate("profileId");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let displayName;

        // 1️⃣ ADMIN → No profile, use username  
        if (user.role === "admin") {
            displayName = user.username || "Administrator";
        }
        // 2️⃣ CUSTOMER → profile.name
        else if (user.role === "customer") {
            displayName = user.profileId?.name || user.username;
        }
        // 3️⃣ VENDOR → profile.businessName
        else if (user.role === "vendor") {
            displayName = user.profileId?.businessName || user.username;
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                role: user.role,
                email: user.email,
                name: displayName
            }
        });

    } catch (err) {
        console.error("getMyProfile ERROR:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
