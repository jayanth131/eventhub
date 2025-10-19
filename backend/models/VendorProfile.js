const mongoose = require('mongoose');
const StandardSlotSchema = new mongoose.Schema({
    time: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
}, { _id: false }); // Do not create an ObjectId for every tiny slot object

const DEFAULT_STANDARD_SLOTS = [
    { time: "9:00am to 12:00pm", price: 10000 },
    { time: "12:00pm to 15:00pm", price: 10000 },
    { time: "15:00pm to 18:00pm", price: 10000 },
    { time: "Full day", price: 30000 },
    { time: "Half day (9:00am to 16:00pm)", price: 15000 }
];

const VendorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    businessName: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['Function Hall', 'Music', 'Decoration', 'Car', 'Catering', 'Pandit'],
        required: true
    },
    description: { type: String },
    location: { type: String, required: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    totalcost: { type: Number, default: 0 }, // --- DEPRECATED FIELD, KEPT FOR BACKWARD COMPATIBILITY ---
    
    // --- MODIFIED/NEW FIELDS ---
    imageUrls: [{ type: String,default:"https://www.venuelook.com/_next/image?url=https%3A%2F%2Fcdn.venuelook.com%2Fuploads%2Fspace_37197%2F1695884162_595x400.png&w=1080&q=75"}], // Array for image URLs (non-required)
    
    standardSlots: { 
        type: [StandardSlotSchema],
        default: DEFAULT_STANDARD_SLOTS // Assign the predefined array as the default value
    },
    ActiveStatus: { 
        type: Boolean, 
        default: true 
    },
    // KEPT: Fixed advance payment amount (number)
    advancePaymentAmount: { 
        type: Number, 
        default: 5000, 
        min: 0, 
    }, 
    
    // --- REMOVED: totalCost is no longer present. ---
    
    availability: [{ // Used for dynamic slot status tracking (booked/blocked)
        date: { type: Date, required: true },
        slots: [{
            time: { type: String }, // Should match one of the standardSlots.time strings
            status: { type: String, enum: ['available', 'booked', 'manual_block'], default: 'available' }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('VendorProfile', VendorProfileSchema);
