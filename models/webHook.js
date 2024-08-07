const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
    },
    uniqueReference: {
      type: String,
    },
    requestBody: {
      type: String,
    },
    requestQuery: {
      type: String,
    },
    headers: {
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

webhookSchema.index({ service: 1, uniqueReference: 1});

module.exports = mongoose.model('Webhooks', webhookSchema);
