const express = require("express");
const router = express.Router();
const User = require("../models/User");   // <-- IMPORTANT

const { adminLogin,getPendingVendors, approveVendor, rejectVendor,getApprovedVendors,
  getRejectedVendors } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
// router.post("/create-admin", async (req, res) => {
//   const admin = await User.create({
//     username: "admin",
//     email: "admin@eventbook.com",
//     password: "Admin@123",
//     role: "admin",
//     roleRef: null,   // REQUIRED!!
//     profileId: null
//   });

//   res.json(admin);
// });




// Admin Login
router.post("/login", adminLogin);



// All below routes require admin permission
router.use(protect, authorize("admin"));

// Fetch list of vendors waiting for approval
router.get("/vendors/pending", getPendingVendors);

// Approve vendor
router.put("/vendors/:vendorId/approve", approveVendor);

// Reject vendor
router.put("/vendors/:vendorId/reject", rejectVendor);

router.get("/vendors/approved", getApprovedVendors);

router.get("/vendors/rejected", getRejectedVendors);

module.exports = router;
