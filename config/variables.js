const dotenv = require('dotenv')

dotenv.config()

module.exports = {
    Mongodb_url : process.env.Mongodb_url,
    MONNIFY_API_KEY: process.env.MONNIFY_API_KEY,
    MONNIFY_SECRET_KEY : process.env.MONNIFY_SECRET_KEY,
    MONNIFY_BASE_URL: process.env.MONNIFY_BASE_URL,
    MONNIFY_WALLET_ACCOUNT : process.env.MONNIFY_WALLET_ACCOUNT,
    MONNIFY_CONTRACT_CODE : process.env.MONNIFY_CONTRACT_CODE,


    VT_PASS_BASE_URL: process.env.VT_PASS_BASE_URL,
    Vt_pass_API_KEY : process.env.Vt_pass_API_KEY,
    Vt_pass_PUBLIC_KEY : process.env.Vt_pass_PUBLIC_KEY,
    Vt_pass_SECRET_KEY : process.env.Vt_pass_SECRET_KEY,
    Vt_pass_USERNAME : process.env.Vt_pass_USERNAME,
    Vt_pass_PASSWORD : process.env.Vt_pass_PASSWORD,
    EMAIL : process.env.EMAIL,
    PASS : process.env.PASS,

    
    JWT_SECRET : process.env.JWT_SECRET,
    PORT : process.env.PORT
    

}