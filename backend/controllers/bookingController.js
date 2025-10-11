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
    // 1. Get data from request body and authenticated user
    const {
        vendorId,
        eventDate, // Date string from frontend
        eventTimeSlot,
        totalCost,
        eventType,
        eventHolderNames, // Array of names
        email,
        phone
        
    } = req.body;

    console.log(`[DEBUG] 1. Incoming Event Date String: ${eventDate}`);

    const customerId = req.user.id; // From the JWT token

    // Start a Mongoose session for transactional guarantees
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- 1. Find Vendor and retrieve ALL necessary display fields ---
        const vendor = await VendorProfile.findById(vendorId).select('category availability advancePaymentAmount').session(session);
        if (!vendor) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Vendor not found.' });
        }

        // CRITICAL: Use the fixed advance payment amount from the VendorProfile
        const advanceAmountPaid = vendor.advancePaymentAmount;

        // **Critical: Check if the slot is free**
        const requestedDate = normalizeDate(eventDate);

        console.log(`[DEBUG] 2. Backend Normalized Date (for saving/checking): ${requestedDate.toISOString()}`);

        let isSlotAvailable = true;

        // Find the date entry in the vendor's availability array
        const dayEntry = vendor.availability.find(item => {
            // item.date is a Date object from Mongoose, so normalizeDate must handle it.
            const itemDate = normalizeDate(item.date);
            return itemDate.getTime() === requestedDate.getTime();
        });


        // Check if the specific time slot is already booked or manually blocked
        if (dayEntry) {
            const slot = dayEntry.slots.find(s => s.time === eventTimeSlot);
            if (slot && slot.status !== 'available') {
                isSlotAvailable = false;
            }
        }

        if (!isSlotAvailable) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Requested slot is already booked or unavailable.' });
        }

        // --- 2. Process Advance Payment (Mock) ---
        const paymentResult = { status: 'success', transactionId: `TRX-${Date.now()}` };

        if (paymentResult.status !== 'success') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Payment processing failed.' });
        }

        // --- 3. Create the Booking Record ---
        // Use the fetched advanceAmountPaid for calculation
        const remainingBalance = totalCost - advanceAmountPaid;

        const newBooking = await Booking.create([{
            customer: customerId,
            vendor: vendorId,
            serviceCategory: vendor.category, // Automatically use vendor's primary category
            // --- CRITICAL ADDITION: Event Details ---
            eventType: eventType,
            eventHolderNames: eventHolderNames,
            // --- REDUNDANT BUT NECESSARY DISPLAY FIELDS (Saved from frontend payload) ---
            vendorName: req.body.vendorName,
            vendorLocation: req.body.vendorLocation,
            email: email,   
            phone: phone,
            // --- END CRITICAL ADDITION ---
            eventDate: requestedDate, // CRITICAL: Save the normalized date
            eventTimeSlot: eventTimeSlot,
            totalCost: totalCost,
            advanceAmountPaid: advanceAmountPaid, // Use the fixed amount from profile
            remainingBalance: remainingBalance,
            paymentStatus: 'paid_advance',
            bookingStatus: 'confirmed'
        }], { session: session });

        // --- 4. Update Vendor Availability (Mark as Booked) ---

        // Check if day entry exists, or create a new one (unchanged logic)
        if (!dayEntry) {
            // New date entry for the vendor
            vendor.availability.push({
                date: requestedDate, // Save the normalized date
                slots: [{ time: eventTimeSlot, status: 'booked' }]
            });
        } else {
            // Update existing date entry
            let slot = dayEntry.slots.find(s => s.time === eventTimeSlot);
            if (slot) {
                slot.status = 'booked';
            } else {
                // Slot not found for this date, push a new one
                dayEntry.slots.push({ time: eventTimeSlot, status: 'booked' });
            }
        }

        // Save the updated vendor document
        await vendor.save({ session: session });

        // --- 5. Commit Transaction ---
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Booking successfully confirmed! Check your dashboard.',
            data: newBooking[0]
        });

    } catch (error) {
        // Rollback transaction on any error
        await session.abortTransaction();
        session.endSession();
        console.error("Booking Creation Error:", error);
        res.status(500).json({ success: false, message: 'Failed to create booking: ' + error.message });
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

        console.log("Booking query:", query);

        // 🔸 Fetch bookings
        const bookings = await Booking.find(query)
            .select('-__v -updatedAt')
            .populate(
                populateVendor
                    ? {
                        path: 'vendor',
                        select: 'businessName location imageUrls'
                    }
                    : {
                        path: 'customer',
                        select: 'username email phone'
                    }
            )
            .sort('-eventDate');
            console.log("Raw bookings fetched:", bookings);

        // 🔸 Transform for frontend
        const transformed = bookings.map(booking => ({
            id: booking._id,
            bookingId: booking._id,
            date: booking.eventDate.toISOString().split('T')[0],
            time: booking.eventTimeSlot,
            total: booking.totalCost,
            paid: booking.advanceAmountPaid,
            balance: booking.remainingBalance,
            status: booking.bookingStatus,
            phone: booking.phone,

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
        console.log("fetching customer bookings ended")

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


