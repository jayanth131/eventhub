// server.js

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors'); 
const bookingRoutes = require('./routes/bookings');
const vendorDashboardRoutes = require('./routes/vendorDashboard'); // <-- NEW IMPORT ADDED
const userRoutes = require('./routes/users'); // <-- NEW IMPORT
require('./models/CustomerProfile');
require('./models/VendorProfile');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// === Middleware ===
app.use(cors());
app.use(express.json()); 

// === Initial Routes ===
app.get('/', (req, res) => {
    res.send('Wedding Booking API is Running!');
});

// === Mount Routers ===
// All Authentication routes start with /api/auth
app.use('/api/auth', authRoutes); 
// All Vendor Discovery routes start with /api/vendors
app.use('/api/vendors', vendorRoutes); 
// All Booking routes start with /api/bookings
app.use('/api/bookings', bookingRoutes); 
// All Vendor Dashboard routes start with /api/vendor
app.use('/api/vendor', vendorDashboardRoutes); // <-- NEW ROUTE MOUNTED

app.use('/api/users', userRoutes); // <-- NEW MOUNT POINT
// === DB Connection Function ===
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Atlas Connected Successfully!');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); 
    }
};

// === Start Server Function ===
const startServer = async () => {
    await connectDB(); // Ensure DB is connected before listening
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

// Start the application
startServer();