const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const paymentValidator = require("../validators/payment.validator")
const authMiddleware = require("../middleware/auth.middleware")

// pay bill
router.post('/bill', paymentController.payBill);

// buy airtime
router.post(
  "/airtime",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.buyAirtime,
  paymentController.buyAirtime
);

// buy data
router.post(
  "/data",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.buyData,
  paymentController.buyData
);

// get variation codes
router.post(
  "/variations",
  paymentValidator.getVariationCodes,
  paymentController.getVariationCodes
);

// verify smile email
router.post(
  "/verify-smile",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.verifySmileEmail,
  paymentController.verifySmileEmail
);

// pay tv subscription
router.post(
  "/tv-subscription",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.payTvSubscription,
  paymentController.payTvSubscription
);

// verify smart card number
router.post(
  "/verify-smart-card",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.verifySmartCardNumber,
  paymentController.verifySmartCardNumber
);

// pay electricity bill
router.post(
  "/electricity-bill",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.payElectricityBill,
  paymentController.payElectricityBill
);

// verify meter number
router.post(
  "/verify-meter",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.verifyMeterNumber,
  paymentController.verifyMeterNumber
);

// pay educational bill
router.post(
  "/education-bill",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.payEducationalBill,
  paymentController.payEducationalBill
);

// verify profile id
router.post(
  "/verify-profile",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.verifyProfileId,
  paymentController.verifyProfileId
);

// requery transaction
router.post(
  "/re-query-transaction",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.reQueryTransaction,
  paymentController.reQueryTransaction
);

// check transactions
router.get(
  "/transactions",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  paymentValidator.checkTransactions,
  paymentController.checkTransactions
);

// initialize deposit
router.post(
 "/deposit",
 authMiddleware.ValidateBearerToken,
 authMiddleware.ValidateUserStatus,
 paymentValidator.initializeDepositViaMonnify,
 paymentController.initializeDepositViaMonnify
);

module.exports = router;
