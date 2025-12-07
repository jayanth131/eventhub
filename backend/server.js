// server.js

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require("path");

// Import Routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const bookingRoutes = require('./routes/bookings');
const vendorDashboardRoutes = require('./routes/vendorDashboard');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');   // ✅ NEW

require('./models/CustomerProfile');
require('./models/VendorProfile');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initial Route
app.get('/', (req, res) => {
    res.send('Wedding Booking API is Running!');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vendor', vendorDashboardRoutes);
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);  // ✅ ADMIN ROUTES ADDED

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Atlas Connected Successfully!');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

// Start Server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
