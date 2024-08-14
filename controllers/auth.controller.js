const handleResponse = require("../helpers/response");
const AuthService = require("../services/authService");
const { resendOTP } = require("../utils/otp");
const logger = require("../utils/logger");

class AuthController {
  register = async (req, res) => {
    try {
      const response = await AuthService.register(req.body);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      logger.error("Error in registration:", error);
      return handleResponse(req, res, { message: error.message }, 500);
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const response = await AuthService.verifyEmail(req.body);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      logger.error("Error in email verification:", error);
      return handleResponse(req, res, { message: error.message }, 500);
    }
  };

  login = async (req, res) => {
    try {
      const response = await AuthService.login(req.body);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      logger.error("Error in login:", error);
      return handleResponse(req, res, { message: error.message }, 500);
    }
  };

  resendOTPController = async (req, res) => {
    const { email } = req.body;

    const result = await resendOTP(email);

    if (result.error) {
      const { error: errorMessage } = result;
      const statusCode = handleResendOTPError(errorMessage);
      return res.status(statusCode).json({ message: errorMessage });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP resent successfully" });
  };
}

// Helper function to handle resend OTP errors
const handleResendOTPError = (errorMessage) => {
  switch (errorMessage) {
    case "User not found":
      return 404;
    case "Failed to send email":
      return 500;
    case "Email already verified":
      return 400; // Return a 400 Bad Request status code
    default:
      return 500;
  }
};
module.exports = new AuthController();
