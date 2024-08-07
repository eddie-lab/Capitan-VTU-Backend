const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.String,
    },
    httpMethod: {
      type: mongoose.Schema.Types.String,
    },
    url: {
      type: mongoose.Schema.Types.String,
    },
    request: {
      type: mongoose.Schema.Types.String,
    },
    headers: {
     type: mongoose.Schema.Types.String,
   },
   response: {
    type: mongoose.Schema.Types.String,
  },
   status: {
    type: mongoose.Schema.Types.String,
    enum: ["failed", "success"]
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

logSchema.index({ service: 1 });

module.exports = mongoose.model("Logs", logSchema);
