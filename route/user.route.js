const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require("../middleware/auth.middleware")

// user profile
router.get(
  "/profile",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  userController.userProfile
);

// User wallet balance
router.get(
  "/wallet",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  userController.wallet
);

module.exports = router
