const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true
    },
    serviceCategory: {
        type: String,
        enum: ['Function Hall', 'Music', 'Decoration', 'Car', 'Catering', 'Pandit'],
        required: true
    },
    email: { type: String, required: true }, // Customer email at time of booking
    phone: { type: String, required: true }, // Customer phone at time of booking

    // --- NEW FIELDS ADDED FOR CUSTOMER DISPLAY ---
    eventHolderNames: {
        type: [String], // Array to store names (e.g., "Krishna," "Radha")
        required: true,
    },
    eventType: {
        type: String, // e.g., 'marriage', 'birthday', 'other'
        required: true,
    },
    // CRITICAL ADDITIONS: Saving display information
    vendorName: {
        type: String, // The vendor's business name at time of booking
        required: true,
    },
    vendorLocation: {
        type: String, // The vendor's location at time of booking
        required: true,
    },
    // --- END NEW FIELDS ---

    eventDate: {
        type: Date,
        required: true
    },
    eventTimeSlot: {
        type: String, // e.g., "Morning", "10:00 AM - 2:00 PM"
        required: true
    },

    totalCost: {
        type: Number,
        required: true
    },
    advanceAmountPaid: {
        type: Number,
        required: true
    },
    remainingBalance: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid_advance', 'paid_full', 'failed'],
        default: 'pending'
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'pending_vendor', 'canceled_customer', 'canceled_vendor', 'completed'],
        default: 'confirmed'
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
