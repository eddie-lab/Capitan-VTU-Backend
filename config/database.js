const mongoose = require('mongoose')
const config = require('./variables')

exports.connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.Mongodb_url,)
        console.log('Connected to Database')
    }catch (error){
        console.error('Database connection failed',error)
        //Retry connection after 5 seconds
        setTimeout(exports.connectDB, 5000)
    }
}