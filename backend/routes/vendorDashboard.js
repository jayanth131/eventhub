// routes/vendorDashboard.js
const express = require('express');
const { 
    getDashboardSummary, 
    cancelBookingVendor, 
    completeBooking,
    blockManualSlot 
} = require('../controllers/vendorController'); // Note: We'll modify vendorController
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require vendor authentication and authorization
router.use(protect, authorize('vendor'));

// Fetch summary data for the dashboard (Bookings, Revenue Graphs)
router.get('/summary', getDashboardSummary);

// Vendor-side action: Cancel a specific booking
router.put('/booking/:bookingId/cancel', cancelBookingVendor);

// Vendor-side action: Mark a booking as completed
router.put('/booking/:bookingId/complete', completeBooking);

// Vendor-side action: Manually block a slot (for offline bookings)
router.post('/availability/block', blockManualSlot);

module.exports = router;