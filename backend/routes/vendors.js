const express = require('express');
const { getVendors, getVendor, getVendorAvailability, getVendorBookingCardDetails,updateVendorActiveStatus      } = require('../controllers/vendorController');
const { protect } = require('../middleware/auth'); 

const router = express.Router();

// 1. FAST, PUBLIC DISCOVERY LIST (Minimal data: Name, Rating, Cost)
router.get('/', getVendors); 

// 2. PROTECTED, DETAIL FETCH (On-demand Slots, Contact, Advance Payment)
router.get('/:vendorId/details/card', protect, getVendorBookingCardDetails); 

router.get('/:vendorId', getVendor); // Kept for individual data access
router.get('/:vendorId/availability', protect, getVendorAvailability); // Kept for legacy/optional use
router.put('/:vendorId/active-status', protect, updateVendorActiveStatus);

module.exports = router;
