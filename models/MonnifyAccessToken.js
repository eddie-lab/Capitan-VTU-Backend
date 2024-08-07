const mongoose = require('mongoose')

const monnifyAccessTokenSchema = new mongoose.Schema(
    {
      token: {
        type: String
      },
      expiresIn: {
        type: String
      },
      expiryDate: {
        type: Date,
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
  
  module.exports = mongoose.model('MonnifyAccessToken', monnifyAccessTokenSchema);