// routes/users.js (New File)
const express = require('express');
const { getMyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Fetch the full profile details of the logged-in user
router.get('/me', protect, getMyProfile); 

module.exports = router;