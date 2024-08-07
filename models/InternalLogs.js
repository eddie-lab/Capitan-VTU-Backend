const mongoose = require('mongoose')
 const internalLogSchema = new mongoose.Schema(
    {
        logId: {
            type: mongoose.Schema.Types.String,
        },
        type: {
            type: mongoose.Schema.Types.String,
        },
        label: {
            type: mongoose.Schema.Types.String,
        },
        message: {
            type: mongoose.Schema.Types.String,
        }
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

 module.exports = mongoose.model("InternalLogs", internalLogSchema)