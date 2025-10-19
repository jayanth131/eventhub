// controllers/userController.js (MODIFIED SECTION)

// ... existing code ...

// @desc    Get current logged-in user's details and profile name
// @route   GET /api/users/me
// @access  Private
const User = require('../models/User'); 

exports.getMyProfile = async (req, res) => {
    try {
        // Fetch User and dynamically populate the profile
        // The path to populate is simply 'profileId' since refPath handles the dynamic model name.
        const user = await User.findById(req.user.id).select('email role profileId roleRef')
            .populate('profileId'); 
            // IMPORTANT: If you were missing the .populate('profileId'), this would crash! 
            // The previous code had it, so let's assume the data access is the issue.

        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }
        
        // --- CRITICAL FIX START ---
        // Access the populated object directly from the user document
        const populatedProfile = user.profileId; 
        
        if (!populatedProfile) {
             return res.status(500).json({ success: false, message: 'User profile data is missing or corrupted.' });
        }

        // Extract the actual name based on the role
        const displayName = (user.role === 'customer') 
            // Use safe optional chaining: populatedProfile is the full document now
            ? populatedProfile.name 
            : populatedProfile.businessName;
        // --- CRITICAL FIX END ---

        res.status(200).json({
            success: true,
            data: {
                id: user.profileId,
                role: user.role,
                email: user.email,
                // The accurate display name
                name: displayName || 'Unnamed User' // Fallback for safety
            }
        });

    } catch (err) {
        console.error("Backend Error in getMyProfile:", err); // Enhanced logging
        res.status(500).json({ success: false, message: 'Internal server error while fetching profile data.' });
    }
};