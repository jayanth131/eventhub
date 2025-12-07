const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Don't return password hash by default
    },
    role: {
        type: String,
       enum: ['customer', 'vendor','admin'], 
        default: 'customer',
        required: true,
    },
    // Reference to the specific profile details
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'roleRef', // Dynamic reference based on the 'role' field
    },
    roleRef: { // <-- NEW FIELD to hold the actual model name for Mongoose
        type: String,
        required: function () {
      return this.role !== "admin";   // required only for vendor & customer
    },
        enum: ['CustomerProfile', 'VendorProfile',null],
        default:null
    }
}, { timestamps: true });

UserSchema.pre('save', function(next) {
    if (this.role === 'customer') {
        this.roleRef = 'CustomerProfile';
    } else if (this.role === 'vendor') {
        this.roleRef = 'VendorProfile';
    }
    next();
});
// ...inside models/User.js (before module.exports)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Pre-save middleware to hash the password
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next(); // CRITICAL: Must call next()
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next(); // CRITICAL: Must call next() on success
    } catch (error) {
        console.error("Hashing failed:", error);
        next(error); // Pass the error back
    }
});

// Instance method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // this.password is the hashed password from the DB (due to select: false, we need to explicitly retrieve it if not already fetched)
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate JWT
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET || 'fallback-secret-key', // Use environment variable!
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// ... replace the existing module.exports in User.js with:
module.exports = mongoose.model('User', UserSchema);
