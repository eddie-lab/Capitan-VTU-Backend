const handleResponse = require("../helpers/response");
const MonnifyService = require("../services/monnify.service")
const BillService = require("../services/bill.service")

class WebhookController {
    handleMonnifyTransactions = async (req, res) => {
      try {
        const response = await MonnifyService.handleWebhookEvents({
          body: req.body,
          headers: req.headers,
          query: req.query,
        });
        const { status, data, message } = response;
  
        return res.status(status === "failed" ? 400 : 200).json({
          status: status === "failed" ? "FAIL" : "SUCCESS",
          message: status === "failed" ? message : undefined,
        });
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
    handleVtPassTransactions = async (req, res) => {
        try {
          const response = await BillService.handleWebhookEvents({
            body: req.body,
            headers: req.headers,
            query: req.query,
          });
          const { status, data, message } = response;
    
          return res.status(200).json({
            response: "success",
          });
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

module.exports = new WebhookController()