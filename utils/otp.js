const nodemailer = require('nodemailer')
const crypto = require('crypto')
const config = require('../config/variables')
const emailTemplate = require('./emailTemplate')
const Users = require('../models/user')



const generateOTP = () =>{
    return crypto.randomInt(100000,999999).toString()
}

const sendEmail = async(email, otp)=>{
    const transporter = nodemailer.createTransport({
        host : "smtp.gmail.com",
        port : 465,
        secure: true,
        auth: {
            user :process.env.MAIL_USER, //SMTP user(email address)
            pass : process.env.MAIL_PASS
        },
        tls: {
            rejectUnauthorized: true
        }
    })
    const mailOptions = {
        to : email,
        from : `Capitan <${config.EMAIL}>`,
        subject : "Verification code",
        html: emailTemplate(otp)
    }
    try {
        await transporter.sendMail(mailOptions)
        return {
            success: true,
            message : "Mail sent Successfully"
        } 
    }catch (error) {
        console.error("Error sending OTP Mail:", error)
        return {error: "Sending  Email Failed"}
    }
}

const resendOTP = async (email) =>{
    const newOTP = generateOTP()

    try {
        //Check if user is registered
        const registeredUser = await Users.findOne({email})

        if(!registeredUser) {
            return {error : "User not found"}
        }
        //checks if user email already verified
        if (registeredUser.emailVerified) {
            return {error: "Email Verified  already"}
        }

        //update user's OTP
        registeredUser.otp = newOTP
        registeredUser.otpExpires = Date.now() + 3600000
        await registeredUser.save()

        //send the new OTP to the users email
        const emailResult = await sendEmail(email,newOTP)
        if (emailResult.error){
            return {error: emailResult.error}
        }
        return {success: true}
    }catch (error){
        console.error('Error resending OTP:', error)
        return {error: "Failed to resend OTP"}
    }
}

module.exports = { generateOTP, sendEmail,resendOTP}