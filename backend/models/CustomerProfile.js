const mongoose = require('mongoose');

const CustomerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: { type: String, required: true },
    phone: { type: String },
    location: { type: String, required: true }, // e.g., City, Zip Code
    // You can add more profile-specific fields here
});

module.exports = mongoose.model('CustomerProfile', CustomerProfileSchema);