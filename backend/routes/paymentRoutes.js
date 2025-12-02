const express = require("express");
const router = express.Router();

const{payRemainingAmount} = require("../controllers/paymentController")
const { createPaymentIntent } = require("../controllers/paymentController");
const { protect } = require('../middleware/auth');
const { saveAdvancePayment, saveFinalPayment } = require("../controllers/paymentController");

router.post("/create-intent", protect, createPaymentIntent);
router.post("/pay-remaining", protect, payRemainingAmount);
router.post("/save-advance", protect, saveAdvancePayment);
router.post("/save-final", protect, saveFinalPayment);

module.exports = router;
