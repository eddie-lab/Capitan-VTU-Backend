const axios = require('axios')
const MonnifyAcccessToken = require('../models/MonnifyAccessToken')
const Log = require('../models/Logs')
const moment = require('moment')
const config = require('../config/variables')
const MonnifyVirtualAccount = require('../models/MonnifyVirtualAccount')
const crypto = require('crypto')
const Transaction = require('../models/Transactions')
const User = require('../models/user')
const Webhook = require('../models/webHook')
const WalletUtils = require('../utils/wallet')
const { truncateSync } = require('fs')


class MonnifyService {
    authenticate = async () => {
        const url = `${config.MONNIFY_BASE_URL}/api/v1/auth/login`

        const clientSecretId = Buffer.from(`${config.MONNIFY_API_KEY}:${config.MONNIFY_SECRET_KEY}`).toString("base64")

        const headers = {
            Authorization: `Basic ${clientSecretId}`,
        }
        try {
            const tokenExists = await MonnifyAcccessToken.findOne({}).sort({createdAt: -1})
            if (tokenExists) {
                //check expire date
                const timeNowInUnix = moment().unix()
                const expiryDateInUnix = moment(tokenExists.expiryDate).unix()

                if (expiryDateInUnix > timeNowInUnix) {
                    return {
                        status : "success",
                        message :"Token retrieved from Cache",
                        data : {
                            token: tokenExists.token,
                            expiresIn : tokenExists.expiresIn,
                        },
                    };
                }
            }

            //request 
            let axiosConfig = {headers}
            const {data} = await axios.post(url,null,axiosConfig);

            const { requestSuccessful, responseBody} = data

            Log.create({
                service : "monnnify",
                httpMethod : "post",
                url,
                request: null,
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: requestSuccessful ? "success" : "failed",
            })

            const {accessToken, expiresIn} = responseBody

            //store in cache
            const cachePayload = {
                token : accessToken,
                expiresIn,
                expiryDate: moment().add(Number(expiresIn), "seconds"),

            }
            MonnifyAcccessToken.create(cachePayload)

            return {
                status : "success",
                message : 'Token refreshed from monnify ',
                data : {token: accessToken, expiresIn}
            }
        }catch (error) {
            console.log(error)
            const errMsg = error.response?.data
                ? error.response?.data?.message: error.message


            Log.create({
                service: "monnify",
                httpMethod: "post",
                url,
                request: null,
                headers: JSON.stringify(headers),
                response: error.response?.data
                  ? JSON.stringify(error.response?.data)
                  : errMsg,
                status: "failed",
            });

            return {
                status: 'failed',
                message: "Request Failed"
            }
        }
    };
    // create virtual account
    createReservedAccount = async (payload) => {
        const tokenData = await this.authenticate()
        if (tokenData.status === 'failed') {
            return {
                status : 'failed',
                message : 'Request failed'
            }
        }

        const url = `${config.MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`;
        const headers = {
            Authorization: `Bearer ${tokenData.data.token}`,
        }
        const { name, _id, email} = payload;
        let requestPayload = {
            accountReference : _id,
            accountName: name,
            currencyCode: "NGN",
            contractCode: config.MONNIFY_CONTRACT_CODE,
            customerEmail: email,
            customerName: name,
            getAllAvailableBanks: true,
        }
        try {
            let axiosConfig = { headers}
            const {data} = await axios.post(url, requestPayload,axiosConfig);
            const {requestSuccessful, responseBody} = data

            Log.create({
                service: "monnify",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: requestSuccessful ? "success" : "failed",
            })

            return {
                status : 'success',
                message : "reserved account created successfully",
                data : responseBody,
            }
        }catch (error) {
            console.log(error)
            const errMsg = error.response?.data
                ?error.response?.data?.message : error.message;

        Log.create({
            service: "monnify",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
              ? JSON.stringify(error.response?.data)
              : errMsg,
            status: "failed",
        })
        return{
            status : 'failed',
            message : "Request failed"
        }
        }
    }

    // save reserve account internal
    saveReservedAccount = async (payload) => {
        const {name, email, _id} = payload;
        try {
            //Check first 
            const virtualAccountsExists = await MonnifyVirtualAccount.find({
                user : _id,
            }).select("-meta");

            if (virtualAccountsExists.length > 0) {
                return {
                    status : "success",
                    message : "Virtual accounts exist",
                    data: {accounts :virtualAccountsExists}
                }
            }
            // if no virtual acct exist 
            const reservedAccountData = await this.createReservedAccount(payload);
            if (reservedAccountData.status === "failed") {
                return {
                    status : 'failed',
                    message : reservedAccountData.message,
                }
            }

            let saveReservedAccount = [];
            if (reservedAccountData.data?.accounts?.length > 0){
                let accounts = reservedAccountData.data.accounts;
                for (let account of accounts) {
                    const accountExist = await MonnifyVirtualAccount.findOne({
                        user: _id,
                        accountNumber : account.accountNumber
                    })
                    if(!accountExist){
                        let newVirtualAcctPayload = {
                            user : _id,
                            referenceNumber: _id,
                            bankCode: account?.bankCode,
                            bankName: account.bankName,
                            reservationReference: reservedAccountData.data?.reservationReference,
                            meta: JSON.stringify(reservedAccountData.data),
                        }
                        const newVirtualAcct = await MonnifyVirtualAccount.create(newVirtualAcctPayload)
                        if (newVirtualAcct){
                            newVirtualAcctPayload['meta'] = undefined
                            newVirtualAcctPayload['_id'] = newVirtualAcct._id
                            saveReservedAccount.push(newVirtualAcctPayload)
                        }
                    }
                }
            }
            return {
                status : "success",
                message : "Virtual accounts saved Successfully",
                data: {accounts: saveReservedAccount},
            }
        }catch (error){
            console.log(error)
            return {
                status : 'failed',
                message : "Request Failed"
            }
        }
    }

    getReservedAccount = async ()=> {
        const tokenData = await this.authenticate()
        if (tokenData.status === "failed"){
            return {
                status : "failed",
                message : "Request failed",
            }
        }
        const url = `${config.MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`
        const headers = {
            Authorization: `Bearer ${tokenData.data.token}`
        }

        const {_id} = payload
        let requestPayload = {accountReference:_id}

        try{
            let axiosConfig = {headers}
            const {data} = await axios.get(`${url}/${_id}`, axiosConfig)
            const {requestSuccessful, responseBody} = data

            Log.create({
                service: "monnify",
                httpMethod: "get",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: requestSuccessful ? "success" : "failed",  
            })
            return {
                status: 'success',
                message: 'Reserved account successfully fetched',
                data : responseBody
            }
        }catch (error) {
            console.log(error)
            const errMsg = error.response?.data
                 ? error.response?.data?.message
                 : error.message;

        Log.create({
                service: "monnify",
                httpMethod: "get",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: error.response?.data
                    ? JSON.stringify(error.response?.data)
                    : errMsg,
                status: "failed",
            });
            return {
                    status: "failed",
                    message: "Request failed",
            };
                 
        }
    }

    initializeTransfer = async (payload) =>{
        const tokenData = await this.authenticate()
        if (tokenData.status === 'failed') {
            return {
                status : 'failed',
                message : 'Request failed: unable to authenticate'
            }
        }
        const { amount, _id, narration, destinationBankCode, destinationAccountNumber, sourceAccountNumber } = payload;

        if (!amount || amount < 50) {
            return {
                status : 'failed',
                message : "Amount is required to be at least 50 NGN"
            }
        }
        if (!_id || !narration || !destinationBankCode || !destinationAccountNumber || !sourceAccountNumber) {
            return {
                status :"Failed",
                message : "Missing required fields"
            }
        }
        // Generate unique payment reference
        const paymentReference = `MNFY|${_id}|${Date.now()}`;

        //set up request payload
        let requestPayload = {
            amount,
            reference: paymentReference,
            narration,
            destinationBankCode,
            destinationAccountNumber,
            currency: 'NGN',
            sourceAccountNumber,
            async: true,

        }
        //define headers with token for authorization
        const url = `${config.MONNIFY_BASE_URL}/api/v2/disbursements/single`
        const headers = {
            Authorization: `Bearer ${tokenData.data.token}`
        }
        try {
            let axiosConfig = {headers}
            const{data} = await axios.post(url,requestPayload,axiosConfig)
            const {requestSuccessful, responseBody} = data;

            //log request and response
            await Log.create({
                service: 'monnify',
                httpMethod: 'post',
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: requestSuccessful ? 'success' : 'failed',
            });

            return {
                status: 'Success',
                message : "Transaction initialized successfully",
                data : responseBody
            }
        }catch (error){
            console.log(error)
            const errMsg = error.response?.data
                ?error.response?.data?.message
                :error.message

            //log error
            Log.create({
                service: 'monnify',
                httpMethod: 'post',
                url: `${config.MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: error.response?.data
                    ? JSON.stringify(error.response?.data)
                    : errMsg,
                status: 'failed',
                });

            return {
                status:'failed',
                message: 'Request failed'
            }
        }
    }

    CheckTransferStatus = async (reference) => {
        try {
            const tokenData = await this.authenticate();
            if (tokenData.status === 'failed') {
                return {
                    status: 'failed',
                    message: 'Failed to retrieve authentication token'
                };
            }
    
            if (!reference) {
                return {
                    status: 'failed',
                    message: 'Transfer reference is required'
                };
            }
    
            const url = `${config.MONNIFY_BASE_URL}/api/v2/disbursements/single/summary?reference=${encodeURIComponent(reference)}`;
            const headers = {
                Authorization: `Bearer ${tokenData.data.token}`
            };
    
            try {
                let axiosConfig = { headers };
                const { data } = await axios.get(url, axiosConfig);
                const { requestSuccessful, responseBody } = data;
    
                // Log the request and response
                await Log.create({
                    service: 'monnify',
                    httpMethod: 'get',
                    url,
                    request: JSON.stringify({ reference }),
                    headers: JSON.stringify(headers),
                    response: JSON.stringify(data),
                    status: requestSuccessful ? 'success' : 'failed',
                });
    
                return {
                    status: requestSuccessful ? 'success' : 'failed',
                    message: requestSuccessful ? 'Transfer status retrieved successfully' : 'Failed to retrieve transfer status',
                    data: responseBody
                };
            } catch (error) {
                console.log(error);
                const errMsg = error.response?.data
                    ? error.response?.data?.message
                    : error.message;
    
                // Log the error
                await Log.create({
                    service: 'monnify',
                    httpMethod: 'get',
                    url,
                    request: JSON.stringify({ reference }),
                    headers: JSON.stringify(headers),
                    response: error.response?.data
                        ? JSON.stringify(error.response?.data)
                        : errMsg,
                    status: 'failed'
                });
    
                return {
                    status: 'failed',
                    message: 'Request failed'
                };
            }
        }catch (error) {
            console.log(error);
            return {
                status: 'failed',
                message: 'Request failed'
            };
        }
    };


    // Function to get the list of banks
    GetBanks = async () => {
        try {
        
            const tokenData = await this.authenticate();
            if (tokenData.status === 'failed') {
                return {
                    status: 'failed',
                    message: 'Failed to retrieve authentication token'
                };
            }

            // Monnify API endpoint for getting banks
            const url = `${config.MONNIFY_BASE_URL}/api/v1/banks`;
            const headers = {
                Authorization: `Bearer ${tokenData.data.token}`,
                Accept: 'application/json'
                };

                try {
                // Make the GET request to Monnify
                    const axiosConfig = { headers };
                    const { data } = await axios.get(url, axiosConfig);
                    const { requestSuccessful, responseBody } = data;

                    // Log the request and response
                    await Log.create({
                        service: 'monnify',
                        httpMethod: 'get',
                        url,
                        request: '{}',  // No body params for this endpoint
                        headers: JSON.stringify(headers),
                        response: JSON.stringify(data),
                        status: requestSuccessful ? 'success' : 'failed',
                     });

                    return {
                        status: requestSuccessful ? 'success' : 'failed',
                        message: requestSuccessful ? 'Banks retrieved successfully' : 'Failed to retrieve banks',
                        data: responseBody
                    };
                } catch (error) {
                    console.log(error);
                    const errMsg = error.response?.data
                        ? error.response?.data?.message
                        : error.message;

                     // Log the error
                    await Log.create({
                    service: 'monnify',
                    httpMethod: 'get',
                    url,
                    request: '{}',  // No body params for this endpoint
                    headers: JSON.stringify(headers),
                    response: error.response?.data
                        ? JSON.stringify(error.response?.data)
                        : errMsg,
                    status: 'failed'
                    });

                    return {
                    status: 'failed',
                    message: 'Request failed'
                 };
                }
        } catch (error) {
            console.log(error);
            return {
                status: 'failed',
                message: 'Request failed'
            };
        }
    };
    saveWebhooksEvents = async (payload) => {
        try{
            const{service,headers,body,query} = payload   //extract from monify payload

            //create new webhook payload
            const newWebHookEventPayload = {
                service: service.toLowerCase(),
                uniqueReference: body?.eventData?.transactionReference || "N/A",
                headers: JSON.stringify(headers || {}),
                requestBody: JSON.stringify(body || {}),
                requestQuery: JSON.stringify(query || {}),
            }
            //save webhook event to database
            await Webhook.create(newWebHookEventPayload)

            return {
                status: "success",
                message: "webhook event successfully saved"
            }
        }catch (error){
            console.error('Error saving webhook:', error)
            return {
                status : "failed",
                message : "request failed"
            }
        }
    }
    processReservedAccountTransactions = async(payload) =>{
        try{
            const {eventData} = payload
            if (!eventData){
                return {
                    status: "failed",
                    message: "Event data missing"
                }
            }
            if (eventData?.product?.type?.trim().toUpperCase() !== "RESERVED_ACCOUNT"){
                return {
                    status : "failed",
                    message : "Wrong product type"
                }
            }
            const reference = eventData?.transactionReference
            const accountNumber = eventData?.destinationAccountInformation?.accountNumber
            const amount = Number(eventData?.amountPaid)
            const paymentStatus = eventData?.paymentStatus

            //check for duplicate transaction
            const TransactionExist = await Transaction.findOne({
                $or: [{externalReference:reference},{reference}],
            })
            if (TransactionExist){
                return {
                    status: "failed",
                    message: "Duplicate Transaction"
                }
            }
            //Account number empty
            if (!accountNumber){
                return {
                    status: "failed",
                    Message: "Account Number is undefined"
                }
            }
            //get virtual account
            const accountExists = await MonnifyVirtualAccount.findOne({accountNumber})
            if (!accountExists){
                return {
                    status : "Failed",
                    message : "Account number could not be found"
                }
            }
            // User exist?
            const userId = accountExists.user
            const userExists = await User.findOne({_id:userId})

            if (!userExists) {
                return {
                    status: "failed",
                    message : "user does not exist"
                }
            }
            //if user exists add transaction
            const newTransactionPayload = {
                user : userExists._id,
                status : paymentStatus.toUpperCase() === "PAID" ? "successful" : "Failed",
                amount,
                source : "Deposit",
                reference,
                externalReference: reference
            }
            await Transaction.create(newTransactionPayload)

            if(paymentStatus.toUpperCase() ==="PAID"){
                //credit wallet
                const walletCredit = await WalletUtils.creditWallet({
                    userId : userExists._id,
                    amount,
                    source:"Deposit",
                })
                if (walletCredit.status == "failed"){
                    return {
                        status: 'failed',
                        message: walletCredit?.message || 'failed to credit wallet'
                    }
                }
            }
            return {
                status: 'success',
                message: "Deposit event processed successfully"
            }

        }catch (error){
            console.log(error)
            return {
                status:"failed",
                message : "Request failed"

            }
        }


    }
    handleWebhookEvents = async(payload)=>{
        try{
            const {body,headers,query} = payload

            //save webhook
            const alreadySavedWebhook = await Webhook.findOne({
                service: "monnify",
                uniqueReference: body?.eventData?.transactionReference
            })
            //save for record
            if (alreadySavedWebhook){
                this.saveWebhooksEvents({body,headers,query,service:"monnify"})
                return {
                    status : "failed",
                    message : "webhook has already been received before"
                }
            }
            //if not exist before  save before processing
            this.saveWebhooksEvents({query,body,headers,service:"monnify"})

            //verify hash 
            const hash = headers?.['monnify-signature']
            const requestPayload = body
            const hashData = JSON.stringify(requestPayload || {})

            const calcualateHash = crypto
                .createHmac("sha512", config.MONNIFY_SECRET_KEY)
                .update(hashData)
                .digest("hex")

            if (calcualateHash !== hash) {
                return {
                    status : "failed",
                    message: "Invalid request, Hash does not match"
                }
            }
            //check for incoming event for reserved account 
            const eventType = requestPayload.eventType
            if (eventType.trim()?.toUpperCase() === "SUCCESSFUL_TRANSACTION"){
                const processRes = await this.processReservedAccountTransactions(requestPayload)
                return {
                    status: processRes.status,
                    message : processRes.message
                }
            }


        }catch (error){
            console.log(error)
            return {
                status: "failed",
                message: "Request failed"
            }
        }
        
    }
    
}    
module.exports = new MonnifyService()
   

