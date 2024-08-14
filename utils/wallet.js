const { id } = require('cls-rtracer')
const wallet = require('../models/wallet')
const WalletAudit = require('../models/walletAudit')
const user = require('../models/user')

exports.debitWallet = async (payload)=>{
    try {
        const {userId, amount, source} = payload
        if(!userId|| !amount) {
            return {
                status: 'failed',
                message: 'UserID and amount are undefined '
            }
        }
        if (amount <=0) {
            return{
                status: "failed",
                message: 'Amount must be greater than 0'
            }
        }
        //Check if wallet exist 
        const WalletExist = await Wallet.findOne({user:userId})
        if (!WalletExist) {
            return {
                status: 'failed',
                message: 'User Wallet does not exist'
            }
        }
        //Insufficient balance?
        if (Number(amount) > Number(WalletExist.balance)) {
            return {
                status: 'failed',
                message: 'Insufficient balance'
            }
        }
        //debit wallet 
        const prevBalance = Number(WalletExist.balance)
        const currentBalance = Number(WalletExist.balance) - Number(amount)
        
        await wallet.updateOne(
            {user: WalletExist.user},
            {balance: Number(currentBalance.toFixed(2))}
        )
        //wallet audit 
        const walletAudit = {
            user: userId,
            transactionType: "DEBIT",
            transactionAmount: Number(amount),
            source: source.toLowerCase(),
            prevBalance: Number(WalletExist.balance),
            currentBalance: Number(currentBalance.toFixed(2)),
        }
        WalletAudit.create(walletAudit)
        return {
            status: "success",
            message: "Wallet debited successfully",
            data:{
                prevBalance,
                currentBalance:Number(currentBalance.toFixed(2))
            }
        }


    }catch (error) {
        console.log(error)
        return{
            status: "failed",
            message :" An unexpected error occured"
        }
    }
}

exports.creditWallet = async(payload)=>{
    try {
        const { userId,amount,source} = payload
        if (!userId || !amount){
            return {
                status : "failed",
                message : "UserID and amount are undefined"
            }
        }

        if (amount < 0) {
            return {
                status: "failed",
                message : "please enter value greater than 0 "
            }
        }
        const walletExist = await wallet.findOne({user:userId})
        if(!walletExist) {
            return {
                status : "failed",
                message : "User wallet does not exist"

            }
        }
        const prevBalance = Number(walletExist.balance)
        const currentBalance = Number(walletExist.balance) + Number(amount)

        await wallet.updateOne(
            {user: walletExist.user},
            {balance:Number(currentBalance.toFixed(2))}
            
        )
        //wallet audit
        const walletAudit = {
            user: userId,
            transactionType: "CREDIT",
            transactionAmount: Number(amount),
            source: source.toLowerCase(),
            prevBalance,
            currentBalance: Number(currentBalance.toFixed(2)),
        };
        WalletAudit.create(walletAudit);

        return {
          status: "success",
          message: "Wallet credited successfully",
          data: {},
        };
    } catch (error) {
        console.log(error);
        return {
          status: "failed",
          message: "An unexpected error occurred, try again later",
        };
    }     
}

exports.BalanceSufficient = async()=>{
    try{
        const {userId,amount} = payload
        if(!userId || amount) {
            return {
                status: 'Failed',
                message: 'UserId and amount is undefined'
            }
        }
        if (amount <= 0) {
            return {
                status: 'failed',
                message: 'Please enter a valid amount'
            }
        }

        //does wallet exist
        const walletExist = await wallet.findOne({ user: userId });
        if (!walletExist) {
        return {
            status: "failed",
            message: "User wallet does not exist",
            };
        }
        // Check for insufficient balance  
        if (Number(amount) > Number(walletExist.balance)) {
            return {
                status: "failed",
                message: "Insufficient balance"
            }
        }
        return{
            status : "success",
            message : 'Sufficient balance'
        }
    
    }catch (error) {
        console.log(error)
        return {
            status: "failed",
            message: "An unexpected error occured, Try again later"

        }
    }
}
