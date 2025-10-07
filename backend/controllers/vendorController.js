const Booking = require('../models/Booking');
const VendorProfile = require('../models/VendorProfile');
const mongoose = require('mongoose');
const User = require('../models/User'); // Required for population
const CustomerProfile = require('../models/CustomerProfile'); // Required for global model registration
const bcrypt = require('bcryptjs'); // Required for global model registration
const jwt = require('jsonwebtoken'); // Required for global model registration


// --- Helper function for date normalization ---
const normalizeDate = (date) => {
    const d = new Date(date);
    // Sets the time part to midnight UTC, ensuring consistency regardless of server timezone
    d.setUTCHours(0, 0, 0, 0);
    return d;
};


// ===========================================
// VENDOR DISCOVERY (List View - Public & Fast)
// ===========================================

// @desc    Search and filter vendors (Returns minimal data for card list)
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res, next) => {
    try {
        let query;
        let queryStr = JSON.stringify(req.query);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        query = VendorProfile.find(JSON.parse(queryStr));

        if (req.query.category) {
            query = query.where('category').equals(req.query.category);
        }

        if (req.query.location) {
            query = query.where('location').regex(new RegExp(req.query.location, 'i'));
        }

        query = query.sort('-averageRating');

        // CRITICAL UPDATE: Select MINIMAL fields AND standardSlots for pricing preview
        query = query.select('businessName description location averageRating totalCost imageUrls reviewCount category standardSlots email phone');

        const vendors = await query;

        res.status(200).json({ success: true, count: vendors.length, data: vendors });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single vendor details (Public)
// @route   GET /api/vendors/:vendorId
// @access  Public
exports.getVendor = async (req, res, next) => {
    try {
        const vendor = await VendorProfile.findById(req.params.vendorId);

        if (!vendor) {
            return res.status(404).json({ success: false, message: `Vendor not found with id of ${req.params.vendorId}` });
        }

        res.status(200).json({ success: true, data: vendor });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get ALL details and filtered slots for the Customer Booking Card
// @route   GET /api/vendors/:vendorId/details/card?date=YYYY-MM-DD
// @access  Private (Used for expanded view on click/booking attempt)
exports.getVendorBookingCardDetails = async (req, res, next) => {
    try {
        const vendorProfileId = req.params.vendorId;
        // 1. Get the requested date from query parameters
        const requestedDate = req.query.date ? normalizeDate(req.query.date) : null;

        if (!requestedDate) {
            // This is the CRITICAL change: the date must be provided by the frontend calendar
            return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required.' });
        }

        // 2. Fetch Vendor Profile including standardSlots and availability
        const vendor = await VendorProfile.findById(vendorProfileId)
            .select('-__v -createdAt -updatedAt')
            .populate({
                path: 'userId',
                select: 'email' // Fetch contact email from User model
            });

        if (!vendor) {
            return res.status(404).json({ success: false, message: `Vendor not found with id of ${vendorProfileId}` });
        }

        // 3. Find the availability entry for the requested date
        const dayEntry = vendor.availability.find(item => {
            const itemDate = normalizeDate(item.date);
            return itemDate.getTime() === requestedDate.getTime();
        });

        // 4. Generate the final slot list by merging defined standard slots with booked status
        const finalSlots = vendor.standardSlots.map(standardSlot => {
            let status = 'available';

            if (dayEntry) {
                // Check if this standard slot time is marked as booked/blocked in the DB
                const bookedSlot = dayEntry.slots.find(dbSlot => dbSlot.time === standardSlot.time);

                if (bookedSlot) {
                    status = bookedSlot.status; // status will be 'booked' or 'manual_block'
                }
            }

            return {
                time: standardSlot.time,
                status: status,
                price: standardSlot.price // Include the specific price of the slot
            };
        });


        // 5. Structure the final output for the frontend card expansion
        const cardData = {
            id: vendor._id,
            serviceName: vendor.businessName,
            description: vendor.description,
            location: vendor.location,
            rating: vendor.averageRating,
            reviewCount: vendor.reviewCount,
            imageUrls: vendor.imageUrls,

            // Pricing/Booking Info
            // totalCost is no longer a single field, so we calculate the min price for general display
            minTotalCost: Math.min(...vendor.standardSlots.map(s => s.price)),
            advancePaymentAmount: vendor.advancePaymentAmount,

            // Filtered Slots (CRITICAL)
            availability: finalSlots,

            // Contact Info
            contactEmail: vendor.email,
            phone:vendor.phone
        };
        console.log("carddata",cardData);
        res.status(200).json({ success: true, data: cardData });
        console.log(cardData);

    } catch (err) {
        console.error("Error fetching vendor card details for expansion:", err);
        res.status(500).json({ success: false, message: 'Error retrieving vendor details for card expansion.' });
    }
};

// @desc    Get vendor availability slots (Protected - Kept for redundancy)
// @route   GET /api/vendors/:vendorId/availability
// @access  Private (Requires JWT)
exports.getVendorAvailability = async (req, res, next) => {
    try {
        // NOTE: This endpoint is technically redundant but kept for API surface compatibility
        const vendor = await VendorProfile.findById(req.params.vendorId)
            .select('availability standardSlots advancePaymentAmount');

        if (!vendor) {
            return res.status(404).json({ success: false, message: `Vendor not found with id of ${req.params.vendorId}` });
        }

        res.status(200).json({
            success: true,
            data: {
                availability: vendor.availability,
                standardSlots: vendor.standardSlots,
                advancePaymentAmount: vendor.advancePaymentAmount
            },
            message: 'Availability and pricing fetched successfully (Requires login)'
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


// ===========================================
// VENDOR DASHBOARD (Private Access)
// ===========================================

// @desc    Get Vendor Dashboard Summary (Bookings, Revenue)
// @route   GET /api/vendor/summary
// @access  Private (Vendor Only)
exports.getDashboardSummary = async (req, res, next) => {
    const vendorId = req.user.profileId; // Use the profileId linked to the User document
    const today = normalizeDate(new Date());

    try {
        // --- 1. Fetch Today's & Upcoming Bookings ---

        // Find bookings for this vendor, confirmed status, starting today or later
        const upcomingBookings = await Booking.find({
            vendor: vendorId,
            bookingStatus: { $in: ['confirmed', 'pending_vendor'] }, // Confirmed or pending acceptance
            eventDate: { $gte: today }
        })
            .select('eventDate eventTimeSlot totalCost remainingBalance customer')
            .populate({
                path: 'customer',
                select: 'username email' // Populate customer info
            })
            .sort('eventDate eventTimeSlot');

        const todaysBookings = upcomingBookings.filter(booking =>
            normalizeDate(booking.eventDate).getTime() === today.getTime()
        );

        // --- 2. Calculate Revenue Metrics (Aggregation) ---
        const revenueSummary = await Booking.aggregate([
            {
                $match: {
                    vendor: new mongoose.Types.ObjectId(vendorId),
                    bookingStatus: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalCost' },
                    totalAdvance: { $sum: '$advanceAmountPaid' },
                    totalCompleted: {
                        $sum: {
                            $cond: [{ $eq: ['$bookingStatus', 'completed'] }, '$totalCost', 0]
                        }
                    },
                    totalCanceled: { $sum: { $cond: [{ $in: ['$bookingStatus', ['canceled_customer', 'canceled_vendor']] }, 1, 0] } }
                }
            }
        ]);

        const revenueData = revenueSummary[0] || {};

        res.status(200).json({
            success: true,
            data: {
                todaysBookings: todaysBookings,
                upcomingEventsCount: upcomingBookings.length,
                overallRevenue: revenueData.totalRevenue || 0,
                completedRevenue: revenueData.totalCompleted || 0,
                cancellationCount: revenueData.totalCanceled || 0,
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching dashboard summary.' });
    }
};


// @desc    Vendor cancels a booking
// @route   PUT /api/vendor/booking/:bookingId/cancel
// @access  Private (Vendor Only)
exports.cancelBookingVendor = async (req, res, next) => {
    const { bookingId } = req.params;
    const vendorProfileId = req.user.profileId; // Profile ID

    // --- Implement Transactional Logic ---
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const booking = await Booking.findById(bookingId).session(session);

        // Check ownership
        if (!booking || booking.vendor.toString() !== vendorProfileId.toString()) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Booking not found or not owned by this vendor.' });
        }

        // 1. Update Booking Status
        booking.bookingStatus = 'canceled_vendor';
        // (Real-world: Add refund initiation logic here)
        await booking.save({ session });

        // 2. Update Vendor Availability (Mark the slot back to 'available')
        const vendor = await VendorProfile.findById(vendorProfileId).session(session);
        const dayEntry = vendor.availability.find(item =>
            normalizeDate(item.date).getTime() === normalizeDate(booking.eventDate).getTime()
        );

        if (dayEntry) {
            const slot = dayEntry.slots.find(s => s.time === booking.eventTimeSlot);
            if (slot) {
                slot.status = 'available'; // Slot is freed up
                await vendor.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: 'Booking canceled and slot freed.', data: booking });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Vendor marks a booking as complete (Final payment/completion logic)
// @route   PUT /api/vendor/booking/:bookingId/complete
// @access  Private (Vendor Only)
exports.completeBooking = async (req, res, next) => {
    const { bookingId } = req.params;
    const vendorProfileId = req.user.profileId;

    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, vendor: vendorProfileId },
            { $set: { bookingStatus: 'completed', paymentStatus: 'paid_full' } },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found or not owned by this vendor.' });
        }

        res.status(200).json({ success: true, message: 'Booking marked as complete.', data: booking });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// @desc    Vendor manually blocks an availability slot
// @route   POST /api/vendor/availability/block
// @access  Private (Vendor Only)
exports.blockManualSlot = async (req, res, next) => {
    const { date, timeSlot } = req.body;
    const vendorProfileId = req.user.profileId;

    if (!date || !timeSlot) {
        return res.status(400).json({ success: false, message: 'Please provide both date and timeSlot.' });
    }

    const normalizedDate = normalizeDate(date);

    try {
        const vendor = await VendorProfile.findById(vendorProfileId);

        // Find existing day entry or prepare a new one
        let dayEntry = vendor.availability.find(item =>
            normalizeDate(item.date).getTime() === normalizedDate.getTime()
        );

        if (!dayEntry) {
            // Create a new date entry
            dayEntry = { date: normalizedDate, slots: [] };
            vendor.availability.push(dayEntry);
        }

        // Check if slot already exists
        let slot = dayEntry.slots.find(s => s.time === timeSlot);

        if (slot) {
            if (slot.status === 'booked') {
                return res.status(400).json({ success: false, message: 'Cannot block a slot that is already confirmed by a customer booking.' });
            }
            // Update existing slot to manual_block
            slot.status = 'manual_block';
        } else {
            // Push new slot as manual_block
            dayEntry.slots.push({ time: timeSlot, status: 'manual_block' });
        }

        await vendor.save();

        res.status(200).json({ success: true, message: 'Slot manually blocked successfully.', data: vendor.availability });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
