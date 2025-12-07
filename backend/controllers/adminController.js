const VendorProfile = require("../models/VendorProfile");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


/************************************
 * GET ALL PENDING VENDOR ACCOUNTS
 ************************************/
exports.getPendingVendors = async (req, res) => {
    try {
        const pendingVendors = await VendorProfile.find({ approvalStatus: "pending" })
            .populate("userId", "username email");

        res.json({ success: true, vendors: pendingVendors });

    } catch (err) {
        console.error("Pending Vendors Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/************************************
 * APPROVE VENDOR
 ************************************/
exports.approveVendor = async (req, res) => {
    try {
        const vendor = await VendorProfile.findById(req.params.vendorId);

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        vendor.approvalStatus = "approved";
        vendor.isApproved = true;
        await vendor.save();

        res.json({ success: true, message: "Vendor approved successfully" });

    } catch (err) {
        console.error("Approve Vendor Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/************************************
 * REJECT VENDOR
 ************************************/
exports.rejectVendor = async (req, res) => {
    try {
        const vendor = await VendorProfile.findById(req.params.vendorId);

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        vendor.approvalStatus = "rejected";
        vendor.isApproved = false;
        await vendor.save();

        res.json({ success: true, message: "Vendor rejected successfully" });

    } catch (err) {
        console.error("Reject Vendor Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


const sendAdminToken = (admin, statusCode, res) => {

  // Admin does NOT have roleRef
  const payload = {
    id: admin._id,
    role: "admin"
  };

  // Create JWT token
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
  
  return res.status(statusCode).json({
    success: true,
    token,
    role: "admin",
    userId: admin._id
  });
};

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    try {
        const admin = await User.findOne({ email, role: "admin" }).select("+password");

        if (!admin) {
            return res.status(401).json({ success: false, message: "Admin account not found" });
        }

        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        sendAdminToken(admin, 200, res);

    } catch (err) {
        console.error("Admin Login Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



exports.getApprovedVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find({ approvalStatus: "approved" })
      .populate("userId", "email username");

    res.json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching approved vendors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all rejected vendors
exports.getRejectedVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find({ approvalStatus: "rejected" })
      .populate("userId", "email username");

    res.json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching rejected vendors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};