const mongoose = require('mongoose');
const userModel = require("./user")

const walletSchema = new mongoose.Schema({

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userModel
    },
    balance: {
      type: mongoose.Schema.Types.Number,
      default: 0
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
);

module.exports = mongoose.model('Wallets', walletSchema)
