const express = require('express');
// CRITICAL: Import the new controller function
const { createBooking, getCustomerBookings } = require('../controllers/bookingController'); 
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// NEW ROUTE: Fetch all bookings for the authenticated customer.
// Endpoint: GET /api/bookings/me
// Access: Private (Customer only)
router.get('/me', protect, authorize('customer'), getCustomerBookings);

// Route for customer to create a new booking (Payment flow initiated here)
router.post('/', protect, authorize('customer'), createBooking); 

module.exports = router;
