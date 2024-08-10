const Joi = require("joi");
const handleResponse = require("../helpers/response");

class AuthValidator {
  register = async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  verifyEmail = async (req, res, next) => {
    const schema = Joi.object({
      otp: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  login = async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  validateResendOTPRequest = async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };
}

module.exports = new AuthValidator();
