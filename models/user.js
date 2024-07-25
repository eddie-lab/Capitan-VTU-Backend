const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password : {
            type: String,
            required : true
        },
        emailVerified: {
            type: mongoose.Schema.Types.Boolean,
            default: false
          },
          accessToken: {
            type: String,
          },
          isActive: {
            type: mongoose.Schema.Types.Boolean,
            default: true
          },
          otp:{
            type: String,
          },
          otpExpires:{
            type: Date
          },

    },
    { 
        timestamps: true,   // Automatic creation of createdAt and updatedAt for document
        toJSON: {
          transform(doc, ret) {
            delete ret.__v;      //deletes internal version key from JSON output
          },
        }
    }
)

module.exports = mongoose.model("User", userSchema)