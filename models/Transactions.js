const mongoose = require('mongoose')
const userModel = require('./user')

const transactionSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Users",
    },
    status : {
        type: String,
        enum: ['successful','failed', 'pending'],
        default: 'pending'
    },
    amount:{
        type: Number
    },
    source: {
        type: String
    },
    serviceId: {
        type: String
    },
    beneficiary: {
        type: String
    },
    reference: {
        type: String,
    },
    externalReference: {
        type: String,
    },
    },
    {
      timestamps: true,
      toJSON: {
        transform(doc, ret) {
          delete ret.__v;
        },
      }
    }
)

// Create indexes on the reference and status fields
transactionSchema.index({ reference: 1 }); // Index for sorting or querying by 'reference' in ascending order
transactionSchema.index({ status: 1 }); // Index for sorting or querying by 'status'

module.exports = mongoose.model('Transactions', transactionSchema)