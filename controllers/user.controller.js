const handleResponse = require("../helpers/response");
const UserService = require("../services/user.service");

class UserController {
  userProfile = async (req, res) => {
    try {
      //TODO: perform user profile logic
      const response = await UserService.userProfile(req.user);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };

  wallet = async (req, res) => {
    try {
      //TODO: perform wallet logic
      const response = await UserService.wallet(req.user);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };
}

module.exports = new UserController();
