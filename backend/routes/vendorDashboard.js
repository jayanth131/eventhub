const express = require('express');
const { 
    getDashboardSummary, 
    cancelBookingVendor, 
    completeBooking,
    blockManualSlot ,
    updateVendorSlots,
    getVendorImages,
    updateProfilePhoto,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

/**
 * PUBLIC ROUTES (no auth required)
 * - Fetch vendor images for public display (frontend calls this without a token)
 */
router.get("/:vendorId/images", getVendorImages);

/**
 * If you want other read-only endpoints to be public, add them above.
 * Now apply auth middleware for all vendor-only routes below.
 */
router.use(protect, authorize('vendor'));

/**
 * PROTECTED / VENDOR-ONLY ROUTES
 * These require a valid token and vendor role.
 */

// Fetch summary data for the dashboard (Bookings, Revenue Graphs)
router.get('/summary', getDashboardSummary);

// Vendor-side action: Cancel a specific booking
router.put('/booking/:bookingId/cancel', cancelBookingVendor);

// Vendor-side action: Mark a booking as completed
router.put('/booking/:bookingId/complete', completeBooking);

// Vendor-side action: Manually block a slot (for offline bookings)
router.post('/availability/block', blockManualSlot);

// Update slots for the vendor (protected)
router.put("/update-slots", updateVendorSlots);

// Upload / update profile photo (protected)
// Multer is defined above; this route will be protected by the router.use call
router.post("/upload-profile-photo", upload.single("photo"), updateProfilePhoto);

module.exports = router;
