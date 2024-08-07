const mongoose = require("mongoose");
const UserModel = require("./user");

const monnifyVirtualAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel
    },
    referenceNumber: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    accountName: {
      type: String,
    },
    bankCode: {
      type: String,
    },
    bankName: {
      type: String,
    },
    reservationReference: {
      type: String,
    },
    meta: {
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
);

monnifyVirtualAccountSchema.index({userId: 1, accountNumber: 1})

module.exports = mongoose.model(
  "monnifyVirtualAccounts",
  monnifyVirtualAccountSchema
);
