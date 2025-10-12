const Booking = require('../models/Booking');
const VendorProfile = require('../models/VendorProfile');
const mongoose = require('mongoose');
const User = require('../models/User');


// --- Helper function for date normalization (CRITICAL FIX) ---
const normalizeDate = (dateInput) => {
    // This function ensures the date saved corresponds exactly to the YYYY-MM-DD
    // intended by the user, regardless of server or client timezone offsets.
    
    // 1. Convert input to a clean YYYY-MM-DD string (e.g., "2025-10-09")
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // 2. Construct a new Date object assuming the client's local date components, 
    // BUT force it to be interpreted as UTC midnight (00:00:00Z).
    // Note: We use local date components to avoid shifting due to the string conversion.
    const utcDate = new Date(Date.UTC(
        year, 
        month, 
        day
    ));

    return utcDate;
};



// @desc    Create a new booking and process advance payment
// @route   POST /api/bookings
// @access  Private (Customer only)
exports.createBooking = async (req, res, next) => {
    const userRole = req.user.role; // 'customer' or 'vendor'
    const userId = req.user.id;
    console.log(req.body)

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let finalVendorId;
        let finalCustomerId;
        let eventType;
        let eventHolderNames;
        let totalCost;
        let advanceAmountPaid;
        let email;
        let phone;

        if (userRole === 'customer') {
            // --- Customer Booking ---
            finalVendorId = req.body.vendorId;
            finalCustomerId = userId;
            eventType = req.body.eventType;
            eventHolderNames = req.body.eventHolderNames; // array of names
            totalCost = req.body.totalCost;
            advanceAmountPaid = req.body.advancePaid;
            email = req.body.email;
            phone = req.body.phone;
        } else if (userRole === 'vendor') {
            // --- Vendor Offline Booking for Walk-in Customer ---
            finalVendorId = req.user.profileId;
            finalCustomerId = req.body.customerId || null; // optional if walk-in
            eventType = req.body.eventType;
            eventHolderNames = req.body.eventHolderNames; // vendor sends customer name
            totalCost = req.body.totalCost;
            advanceAmountPaid = req.body.advancePaid;
            console.log(advanceAmountPaid) // vendor may pay partial/full or 0
            email = req.body.email || null;
            phone = req.body.phone || null;
        } else {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: 'Unauthorized user role.' });
        }

        // --- Find Vendor ---
        const vendor = await VendorProfile.findById(finalVendorId)
            .select('category availability advancePaymentAmount')
            .session(session);

        if (!vendor) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Vendor not found.' });
        }

        const requestedDate = normalizeDate(req.body.eventDate);
        let isSlotAvailable = true;

        const dayEntry = vendor.availability.find(item => normalizeDate(item.date).getTime() === requestedDate.getTime());
        if (dayEntry) {
            const slot = dayEntry.slots.find(s => s.time === req.body.eventTimeSlot);
            if (slot && slot.status !== 'available') {
                isSlotAvailable = false;
            }
        }

        if (!isSlotAvailable) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Requested slot is already booked or unavailable.' });
        }

        // --- Payment & Booking Status ---
        let paymentStatus = 'paid_advance';
        let bookingStatus = 'confirmed';

        if (userRole === 'vendor') {
            // Offline vendor booking → manual
            paymentStatus = 'manual';
            bookingStatus = 'confirmed';
            if (!advanceAmountPaid) advanceAmountPaid = 0;
        }

        const remainingBalance = totalCost - advanceAmountPaid;

        // --- Create Booking ---
        const newBooking = await Booking.create([{
            customer: finalCustomerId,
            vendor: finalVendorId,
            serviceCategory: vendor.category,
            eventType,
            eventHolderNames,
            vendorName: req.body.vendorName || vendor.name,
            vendorLocation: req.body.vendorLocation || "",
            email,
            phone,
            eventDate: requestedDate,
            eventTimeSlot: req.body.eventTimeSlot,
            totalCost,
            advanceAmountPaid,
            remainingBalance,
            paymentStatus,
            bookingStatus
        }], { session });

        // --- Update Vendor Availability ---
        if (!dayEntry) {
            vendor.availability.push({
                date: requestedDate,
                slots: [{ time: req.body.eventTimeSlot, status: 'booked' }]
            });
        } else {
            const slot = dayEntry.slots.find(s => s.time === req.body.eventTimeSlot);
            if (slot) {
                slot.status = 'booked';
            } else {
                dayEntry.slots.push({ time: req.body.eventTimeSlot, status: 'booked' });
            }
        }

        await vendor.save({ session });

        await session.commitTransaction();
        session.endSession();
        console.log('New Booking Created:', newBooking[0]);

        res.status(201).json({
            success: true,
            message: userRole === 'vendor'
                ? 'Offline booking successfully created!'
                : 'Booking successfully confirmed! Check your dashboard.',
            data: newBooking[0]
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Booking Creation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking: ' + error.message
        });
    }
};
// --- NEW FUNCTION TO BE ADDED ---
// @desc    Get all bookings for the authenticated customer
// @route   GET /api/bookings/me
// @access  Private (Customer Only)
exports.getCustomerBookings = async (req, res, next) => {
    console.log("fetching customer bookings started")
    try {
        let query = {};
        let populateVendor = true;

        if (req.user.role === 'customer') {
            // 📌 Customer — fetch bookings where the user is the customer
            query = { customer: req.user.id };
        } else if (req.user.role === 'vendor') {
            // 📌 Vendor — fetch bookings where the vendor is the profileId (vendorId)
            query = { vendor: req.user.profileId };
            populateVendor = false; // vendor already knows their info
        } else {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Only customers or vendors can access bookings.'
            });
        }

        // console.log("Booking query:", query);

        // 🔸 Fetch bookings
        const bookings = await Booking.find(query)
            .select('-__v -updatedAt')
            .populate(
                populateVendor
                    ? {
                        path: 'vendor',
                        select: 'businessName location imageUrls email phone vendor'
                    }
                    : {
                        path: 'customer',
                        select: 'username email phone'
                    }
            )
            .sort('-eventDate');
            // console.log("Raw bookings fetched:", bookings);

        // 🔸 Transform for frontend
        const transformed = bookings.map(booking => ({
            profileId:booking.vendor,
            id: booking._id,
            bookingId: booking._id,
            date: booking.eventDate.toISOString().split('T')[0],
            time: booking.eventTimeSlot,
            total: booking.totalCost,
            paid: booking.advanceAmountPaid,
            balance: booking.remainingBalance,
            status: booking.bookingStatus,
            phone: booking.phone,
            email: booking.email,    

            ...(req.user.role === 'customer'
                ? {
                    vendorName: booking.vendor?.businessName || 'N/A',
                    vendorLocation: booking.vendor?.location || 'N/A',
                    vendorImage:
                        booking.vendor?.imageUrls?.[0] ||
                        'https://placehold.co/800x600/8B0000/FFD700?text=Venue'
                }
                : {
                    customerName: booking.customer?.username || 'N/A',
                    customerEmail: booking.customer?.email || 'N/A',
                    customerPhone: booking.customer?.phone || 'N/A'
                }),

            eventHolderNames: booking.eventHolderNames,
            eventType: booking.eventType
        }));

        console.log("Transformed bookings:", transformed);
        // console.log("fetching customer bookings ended")

        res.status(200).json({
            success: true,
            count: transformed.length,
            data: transformed
        });

    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve booking history.'
        });
    }
};


