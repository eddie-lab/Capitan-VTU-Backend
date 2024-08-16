const logger = require('../utils/logger')

const handleResponse = async (req,res,payload,statusCode)=>{
    try {
        //IpAddress extraction
        const ipAddress = req.ip ||req.headers["X-forwarded-for"] || req.socket.remoteAddress;

        //logs http status code....., if equals to 400or higher logs payload as a string, else success
        let responseDataAsString = JSON.stringify(payload)
        logger(module).info(`${statusCode} - ${req.method} - ${ipAddress} - ${req.orginalUrl} 
        - ${statusCode >= 400 ? responseDataAsString: 'success'}`)

        res.setHeader("cache-control", "no-cache")
        res.setHeader("Pragma", "no-store");
        res.setHeader("X-XSS-Protection", "1; mode=block");

        return res.status(statusCode).json({
            data: payload,
            status : statusCode < 400 ? "success" :"error"
        })
    }catch (error) {
        console.log(error)
        return res.status(500).json({
            data : {message: "An unexpected error occurred"},
            status: "error"
        })
    }
}

module.exports = handleResponse