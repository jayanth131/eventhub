// routes/auth.js
const express = require('express');
const { registerCustomer, registerVendor, login } = require('../controllers/authController');
const router = express.Router();

router.post('/signup/customer', registerCustomer);
router.post('/signup/vendor', registerVendor);
router.post('/login', login);

module.exports = router;