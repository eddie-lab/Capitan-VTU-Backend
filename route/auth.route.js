const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authValidator = require("../validators/auth.validator");

// User registration
router.post("/register", authValidator.register, authController.register);

// User verify email
router.post(
  "/verify-email",
  authValidator.verifyEmail,
  authController.verifyEmail
);

// User login
router.post("/login", authValidator.login, authController.login);

// Resend OTP route
router.post(
  "/resend-otp",
  authValidator.validateResendOTPRequest,
  authController.resendOTPController
);

module.exports = router;
