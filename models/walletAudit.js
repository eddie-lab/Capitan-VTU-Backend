const mongoose = require('mongoose')
const userModel = require('./user')


const walletAuditSchema = new mongoose.Schema(
    {
        user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: userModel
        },
        transactionType: {
            type: String,
            enum: ["DEBIT", "CREDIT"]
        },
        transactionAmount: {
            type: mongoose.Schema.Types.Number,
        },
        source: {
           type: String,
        },
        prevBalance: {
             type: mongoose.Schema.Types.Number,
             default: 0
        },
        currentBalance: {
            type: mongoose.Schema.Types.Number,
            default: 0
        },

    },
    {
        toJSON: {
            transform(doc, ret) {
              delete ret.__v;
            },
        }
        
    }
);

module.exports = mongoose.model("WalletAudits", walletAuditSchema)