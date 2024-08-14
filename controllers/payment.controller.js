const handleResponse = require("../helpers/response");
const PaymentService = require("../services/payment.service");

class PaymentController {
  payBill = async (req, res) => {
    try {
      //TODO: perform user profile logic
      const response = await PaymentService.payBill(req.body);
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

  buyAirtime = async (req, res) => {
    try {
      const response = await PaymentService.buyAirtime({
        user: req.user,
        data: req.body,
      });
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

  getVariationCodes = async (req, res) => {
    try {
      const response = await PaymentService.getVariationCodes({
        user: req.user,
        data: req.body,
      });
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

  buyData = async (req, res) => {
    try {
      const response = await PaymentService.buyData({
        user: req.user,
        data: req.body,
      });
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

  verifySmileEmail = async (req, res) => {
    try {
      const response = await PaymentService.verifySmileEmail({
        user: req.user,
        data: req.body,
      });
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

  payTvSubscription = async (req, res) => {
    try {
      const response = await PaymentService.payTvSubscription({
        user: req.user,
        data: req.body,
      });
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

  verifySmartCardNumber = async (req, res) => {
    try {
      const response = await PaymentService.verifySmartCardNumber({
        user: req.user,
        data: req.body,
      });
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

  payElectricityBill = async (req, res) => {
    try {
      const response = await PaymentService.payElectricityBill({
        user: req.user,
        data: req.body,
      });
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

  verifyMeterNumber = async (req, res) => {
    try {
      const response = await PaymentService.verifyMeterNumber({
        user: req.user,
        data: req.body,
      });
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

  payEducationalBill = async (req, res) => {
    try {
      const response = await PaymentService.payEducationalBill({
        user: req.user,
        data: req.body,
      });
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

  verifyProfileId = async (req, res) => {
    try {
      const response = await PaymentService.verifyProfileId({
        user: req.user,
        data: req.body,
      });
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

  reQueryTransaction = async (req, res) => {
    try {
      const response = await PaymentService.reQueryTransaction({
        user: req.user,
        data: req.body,
      });
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

  checkTransactions = async (req, res) => {
    try {
      const response = await PaymentService.checkTransactions({
        userId: req.user._id,
        ...req.query,
      });
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

  initializeDepositViaMonnify = async (req, res) => {
    try {
      const response = await PaymentService.initializeDepositViaMonnify({
        ...req.user,
        ...req.body,
      });
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

module.exports = new PaymentController();
