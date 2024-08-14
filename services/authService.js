const User = require("../models/user");
const bcrypt = require("bcryptjs");
const Wallet = require("../models/wallet");
const jwt = require("jsonwebtoken");
const config = require("../config/variables");
const MonnifyService = require("../services/monnify.service");
const { generateOTP, sendEmail } = require("../utils/otp");
const crypto = require('crypto'); // Import crypto for generating the token

class AuthService {
  register = async (payload) => {
    try {
      const { email, name, password } = payload;

      const userExists = await User.findOne({ email: email.toLowerCase() });

      if (userExists) {
        return {
          status: "failed",
          message: "User with the same email exists already",
        };
      }

      // Hash the password
      let passwordHashed = bcrypt.hashSync(password, 10);
      let otp = generateOTP();

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create user
      let newUserPayload = {
        email: email.toLowerCase(),
        name,
        password: passwordHashed,
        otp: otp,
        otpExpires: Date.now() + 3600000,
        verificationToken, // Save the verification token
        verificationTokenExpires: Date.now() + 3600000, // Token expiration time
      };

      const newUser = await User.create(newUserPayload);

      // Send OTP email
      sendEmail(email.toLowerCase(), otp);

      // Send email verification link
      const verificationLink = `${config.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}`;
      const emailSubject = "Verify Your Email Address";
      const emailBody = `Hello ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 1 hour.\n\nThank you!`;

      await sendEmail({
        to: email.toLowerCase(),
        subject: emailSubject,
        text: emailBody,
      });

      return {
        status: "success",
        message: "User registration successful, verification email sent",
        data: { data: newUserPayload },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };


  verifyEmail = async (payload) => {
    try {
      const { otp } = payload;
      const currentTime = Date.now();

      const userExists = await User.findOne({
        otp,
        otpExpires: { $gt: currentTime },
      });

      if (!userExists) {
        return {
          status: "failed",
          message: "Invalid OTP or OTP has expired",
        };
      }

      if (userExists.emailVerified) {
        return {
          status: "failed",
          message: "email has already been verified",
        };
      }

      await User.updateOne({ _id: userExists._id }, { emailVerified: true });

      //create user wallet
      const userWalletExists = await Wallet.findOne({ user: userExists._id });

      if (!userWalletExists) {
        Wallet.create({ user: userExists._id });
      }

      // generate virtual account
      MonnifyService.saveReservedAccount({
        name: userExists.name,
        email: userExists.email,
        _id: userExists._id,
      });

      return {
        status: "success",
        message: "Email verification successful",
        data: {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  login = async (payload) => {
    try {
      const { email, password } = payload;

      const userExists = await User.findOne({ email: email.toLowerCase() });

      if (!userExists) {
        return {
          status: "failed",
          message: "Account does not exist",
        };
      }

      //compare password
      const isPasswordValid = bcrypt.compareSync(password, userExists.password);

      if (!isPasswordValid) {
        return {
          status: "failed",
          message: "Oops! You used the wrong credentials",
        };
      }

      //check if user is verified
      if (!userExists.emailVerified) {
        return {
          status: "failed",
          message: "Please verify your account",
        };
      }

      //generate token
      const tokenPayload = {
        id: userExists._id,
        email: userExists.email,
        type: "LOGIN_TOKEN",
      };
      const token = jwt.sign(tokenPayload, config.JWT_SECRET, {
        expiresIn: config.LOGIN_EXPIRES_IN || "24h",
      });

      userExists.accessToken = token;
      userExists.save();
      
      //fetch user and wallet data
      const [user, wallet] = await Promise.all([
        User.findOne({ _id: userExists._id }).select(
          "-password -__v -accessToken"
        ),
        Wallet.findOne({ user: userExists._id }),
      ]);

      return {
        status: "success",
        message: "User login successful",
        data: { user, token, wallet },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };
}

module.exports = new AuthService();

