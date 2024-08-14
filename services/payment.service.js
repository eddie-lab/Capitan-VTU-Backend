const Wallet = require("../models/wallet");
const WalletAudit = require("../models/walletAudit");
const Transaction = require("../models/Transactions");
const MonnifyService = require("../services/monnify.service");
const BillService = require("./bill.service");
const { v4: uuidv4 } = require("uuid");
const WalletUtils = require("../utils/wallet");
const moment = require("moment");


class PaymentService{
    payBill = async (payload) => {
        try {
          return {
            status: "success",
            message: "Bill payment successful",
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

    buyAirtime = async(payload)=>{
        try{
            const {user,data} = payload
            const {amount,source,serviceId} = data

            const walletCheckRes = await WalletUtils.BalanceSufficient({
                userId: user._id,
                amount:Number(amount)
            })

            if(walletCheckRes.status === "failed"){
                return{
                    status: "failed",
                    message: walletCheckRes?.message || "Request failed"
                }
            }
             //generate unique transaction reference so everytime purchase is made we have a unique reference
            const preReference = moment().utcOffset(1).format("YYYYMMDDHHmm");

            const reference = `${preReference}${uuidv4()}`;

            const billServiceRes = await BillService.buyAirtime({
                ...data,
                reference,
            });
            if (billServiceRes.status === "failed") {
                return {
                  status: "failed",
                  message: "Request failed, try again later!",
                };
              }
        
              if (billServiceRes.status === "success") {
                //wallet debit
                const walletDebitRes = await WalletUtils.debitWallet({
                  userId: user._id,
                  amount: Number(amount),
                  source: "bill-payment",
                });
        
                if (walletDebitRes.status == "failed") {
                  return {
                    status: "failed",
                    message: walletDebitRes?.message || "failed to debit wallet",
                  };
                }
        
                Transaction.create({
                  user: user._id,
                  status: "successful",
                  amount: Number(amount),
                  source: `bill-payment`,
                  serviceId,
                  beneficiary: phone,
                  reference,
                  externalReference: billServiceRes.data?.transactionId?.toString(),
                });
              }
              return {
                status: "success",
                message: "Airtime purchase successful",
                data: billServiceRes?.data || {},
              };
        } catch (error) {
            console.log(error);
            return {
                status: "failed",
                message: "An unexpected error occurred, try again later",
            };
            
        }
    }

    getVariationCodes = async (payload) => {
        try {
          const { user, data } = payload;
          const { serviceId } = data;
    
          const billServiceRes = await BillService.getDataVariationCodes({
            ...data,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: "Request failed, try again later!",
            };
          }
    
          return {
            status: "success",
            message: "Variation codes retrieved successfully",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };

    buyData = async (payload) => {
        try {
          const { user, data } = payload;
          const { amount, phone, serviceId, billersCode, variationCode, quantity } =
            data;
    
          const walletCheckRes = await WalletUtils.checkForSufficientWallet({
            userId: user._id,
            amount: Number(amount),
          });
    
          if (walletCheckRes.status == "failed") {
            return {
              status: "failed",
              message: walletCheckRes?.message || "Request failed",
            };
          }
    
          const preReference = moment().utcOffset(1).format("YYYYMMDDHHmm");
    
          const reference = `${preReference}${uuidv4()}`;
    
          const billServiceRes = await BillService.buyData({
            ...data,
            reference,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: "Request failed, try again later!",
            };
          }
    
          if (billServiceRes.status === "success") {
            //wallet debit
            const walletDebitRes = await WalletUtils.debitWallet({
              userId: user._id,
              amount: Number(amount),
              source: "bill-payment",
            });
    
            if (walletDebitRes.status == "failed") {
              return {
                status: "failed",
                message: walletDebitRes?.message || "failed to debit wallet",
              };
            }
    
            Transaction.create({
              user: user._id,
              status: "successful",
              amount: Number(amount),
              source: `bill-payment`,
              serviceId,
              beneficiary: phone,
              reference,
              externalReference: billServiceRes.data?.transactionId?.toString(),
            });
          }
          return {
            status: "success",
            message: "Data subscription purchase successful",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };

    verifySmileEmail = async (payload) => {
        try {
          const { user, data } = payload;
          const { serviceId, billersCode } = data;
    
          const billServiceRes = await BillService.verifySmileEmail({
            ...data,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: billServiceRes.message || "Request failed, try again later!",
            };
          }
    
          return {
            status: "success",
            message: "Email verified successfully",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };

    payTvSubscription = async (payload) => {
        try {
          const { user, data } = payload;
          const {
            amount,
            phone,
            serviceId,
            billersCode,
            variationCode,
            quantity,
            subscriptionType,
          } = data;
    
          const walletCheckRes = await WalletUtils.checkForSufficientWallet({
            userId: user._id,
            amount: Number(amount),
          });
    
          if (walletCheckRes.status == "failed") {
            return {
              status: "failed",
              message: walletCheckRes?.message || "Request failed",
            };
          }
    
          const preReference = moment().utcOffset(1).format("YYYYMMDDHHmm");
    
          const reference = `${preReference}${uuidv4()}`;
    
          const billServiceRes = await BillService.payTVSubscription({
            ...data,
            reference,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: "Request failed, try again later!",
            };
          }
    
          if (billServiceRes.status === "success") {
            //wallet debit
            const walletDebitRes = await WalletUtils.debitWallet({
              userId: user._id,
              amount: Number(amount),
              source: "bill-payment",
            });
    
            if (walletDebitRes.status == "failed") {
              return {
                status: "failed",
                message: walletDebitRes?.message || "failed to debit wallet",
              };
            }
    
            Transaction.create({
              user: user._id,
              status: "successful",
              amount: Number(amount),
              source: `bill-payment`,
              serviceId,
              beneficiary: phone,
              reference,
              externalReference: billServiceRes.data?.transactionId?.toString(),
            });
          }
          return {
            status: "success",
            message: "TV subscription purchase successful",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };
    verifySmartCardNumber = async (payload) => {
        try {
          const { user, data } = payload;
          const { serviceId, billersCode } = data;
    
          const billServiceRes = await BillService.verifySmileEmail({
            ...data,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: billServiceRes.message || "Request failed, try again later!",
            };
          }
    
          return {
            status: "success",
            message: "Smart card verified successfully",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };
    payElectricityBill = async (payload) => {
        try {
          const { user, data } = payload;
          const {
            amount,
            phone,
            serviceId,
            billersCode,
            variationCode,
            quantity,
            subscriptionType,
          } = data;
    
          const walletCheckRes = await WalletUtils.checkForSufficientWallet({
            userId: user._id,
            amount: Number(amount),
          });
    
          if (walletCheckRes.status == "failed") {
            return {
              status: "failed",
              message: walletCheckRes?.message || "Request failed",
            };
          }
    
          const preReference = moment().utcOffset(1).format("YYYYMMDDHHmm");
    
          const reference = `${preReference}${uuidv4()}`;
    
          const billServiceRes = await BillService.payElectricityBill({
            ...data,
            reference,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: "Request failed, try again later!",
            };
          }
    
          if (billServiceRes.status === "success") {
            //wallet debit
            const walletDebitRes = await WalletUtils.debitWallet({
              userId: user._id,
              amount: Number(amount),
              source: "bill-payment",
            });
    
            if (walletDebitRes.status == "failed") {
              return {
                status: "failed",
                message: walletDebitRes?.message || "failed to debit wallet",
              };
            }
    
            Transaction.create({
              user: user._id,
              status: "successful",
              amount: Number(amount),
              source: `bill-payment`,
              serviceId,
              beneficiary: phone,
              reference,
              externalReference: billServiceRes.data?.transactionId?.toString(),
            });
          }
          return {
            status: "success",
            message: "Electricity bill purchase successful",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };

    verifyMeterNumber = async(payload)=>{
        try{
            const {user,data} =payload
            const {serviceId,billersCode,type} =data

            const billServiceRes = await BillService.verifyMeterNumber({
                ...data
            })

            if (billServiceRes.status ==="failed"){
                return{
                    status: 'Failed',
                    message: billServiceRes?.message ||"Request failed ,try again later"
                }
            }
            return {
                status: "success",
                data: billServiceRes?.data ||{},
                message: "An unexpected error occurred, try again later"
            }
        }catch (error){
            console.log(error)
            return {
                status :"failed",
                message :'An unexpected error occured , try again later'
            }
        }
    }

    payEducationalBill = async (payload) => {
        try {
          const { user, data } = payload;
          const { amount, phone, serviceId, billersCode, variationCode, quantity } =
            data;
    
          const walletCheckRes = await WalletUtils.checkForSufficientWallet({
            userId: user._id,
            amount: Number(amount),
          });
    
          if (walletCheckRes.status == "failed") {
            return {
              status: "failed",
              message: walletCheckRes?.message || "Request failed",
            };
          }
    
          const preReference = moment().utcOffset(1).format("YYYYMMDDHHmm");
    
          const reference = `${preReference}${uuidv4()}`;
    
          const billServiceRes = await BillService.payEducationalBill({
            ...data,
            reference,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: "Request failed, try again later!",
            };
          }
    
          if (billServiceRes.status === "success") {
            //wallet debit
            const walletDebitRes = await WalletUtils.debitWallet({
              userId: user._id,
              amount: Number(amount),
              source: "bill-payment",
            });
    
            if (walletDebitRes.status == "failed") {
              return {
                status: "failed",
                message: walletDebitRes?.message || "failed to debit wallet",
              };
            }
    
            Transactions.create({
              user: user._id,
              status: "successful",
              amount: Number(amount),
              source: `bill-payment`,
              serviceId,
              beneficiary: phone,
              reference,
              externalReference: billServiceRes.data?.transactionId?.toString(),
            });
          }
          return {
            status: "success",
            message: "Educational bill purchase successful",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };

    verifyProfileId = async (payload) => {
        try {
          const { user, data } = payload;
          const { serviceId, billersCode, type } = data;
    
          const billServiceRes = await BillService.verifyProfileId({
            ...data,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: billServiceRes.message || "Request failed, try again later!",
            };
          }
    
          return {
            status: "success",
            message: "Profile Id verified successfully",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    };

    reQueryTransaction = async (payload) => {
        try {
          const { user, data } = payload;
          const { requestId } = data;
    
          const billServiceRes = await BillService.reQueryTransaction({
            ...data,
          });
    
          if (billServiceRes.status === "failed") {
            return {
              status: "failed",
              message: "Request failed, try again later!",
            };
          }
    
          return {
            status: "success",
            message: "Transaction details fetched successfully",
            data: billServiceRes?.data || {},
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    }

    checkTransactions = async (payload) => {
        try {
        
          const { userId, status, page, perPage, source, serviceId, beneficiary } = payload;
      
          // Initialize an empty query object to store the filters
          const query = {};
      
          // Apply filters to the query object if they exist in the payload
          if (userId) query["user"] = userId; 
          if (status) query["status"] = status.toLowerCase(); 
          if (source) query["source"] = source.toLowerCase(); 
          if (serviceId) query["serviceId"] = new RegExp(`${serviceId}`, "i"); // Filter by service ID using a case-insensitive regex
          if (beneficiary) query["beneficiary"] = beneficiary; 
      
          // Set pagination parameters: page number and limit (items per page)
          let pageNumber, limit;
      
          // Determine the page number; default to 1 if not provided
          if (page) {
            pageNumber = Number(page);
          } else {
            pageNumber = 1;
          }
      
          // Determine the number of items per page; default to 20 if not provided
          if (perPage) {
            limit = Number(perPage);
          } else {
            limit = 20;
          }
      
          // Calculate the offset (number of items to skip) based on the page number and limit
          const offset = Number(limit) * (Number(pageNumber) - 1);
      
          // Fetch the total count of transactions matching the query and the transactions themselves
          const [total, transactions] = await Promise.all([
            Transaction.countDocuments(query), // Get the total number of matching transactions
            Transaction.find(query) // Retrieve the transactions matching the query
              .limit(limit) // Limit the results to the specified number per page
              .skip(offset) // Skip the appropriate number of transactions for pagination
              .sort({ createdAt: -1 }), // Sort the results by creation date in descending order
          ]);
      
          // Return a success response with the retrieved transactions and total count
          return {
            status: "success",
            message: "Transactions retrieved successfully",
            data: { transactions, total },
          };
        } catch (error) {
          // Handle any errors that occur during the process
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    }
      
    checkWalletBalance = async (payload) => {
        try {
          const { userId } = payload;
          const walletExists = await Wallet.findOne({ user: userId });
    
          if (!walletExists) {
            return {
              status: "failed",
              message: "No wallet was found for this user",
            };
          }
          return {
            status: "success",
            message: "Wallet retrieved successfully",
            data: { wallet: walletExists },
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "An unexpected error occurred, try again later",
          };
        }
    }; 
    
    initializeDepositViaMonnify = async (payload) => {
        try {
          const { _id, name, email, amount } = payload;
    
          const reservedAccounts = await MonnifyService.saveReservedAccount({
            _id,
            name,
            email,
          });
    
          if (reservedAccounts.status === "failed") {
            return {
              status: "failed",
              message: "Request failed, try again later",
            };
          }
    
          return {
            status: "success",
            message: `Deposit initialized successfully. Make a transfer of ${amount} into any of the accounts`,
            data: { accounts: reservedAccounts?.data?.accounts },
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
    
module.exports = new PaymentService();
    
