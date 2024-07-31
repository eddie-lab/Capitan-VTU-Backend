const rTracer = require('cls-rtracer')
const path = require('path')
const fs = require('fs')
const Module = require('module')
const InternalLog = require('../models/InternalLogs')

const {createLogger, format, transports } = require('winston')  //imports winston cmponent for logging
const {combine, timestamp, printf,label} = format

// Extract label from calling modules filename
const getLogLabel = (callingModule) => {
    const parts = callingModule.filename.split(path.sep); // Split the filename into parts based on the path separator
    return path.join(parts[parts.length - 2], parts.pop()); // Join the last two parts to create a label (e.g., 'directory/filename')
};
 
/**
 * Creates a Winston logger object.
 * ### Log Format
 * *| timestamp | request-id | module/filename | log level | log message |*
 *
 * @param {Module} callingModule the module from which the logger is called
 */

const logger = (callingModule) =>
    createLogger({
      format: combine(
        format.colorize(),
        label({ label: getLogLabel(callingModule) }),  //add a label with module/filename
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),  //add timestamps
        printf((info) => {
          const rid = rTracer.id();

        // Remove color codes from log level
        let logLevel = info?.level?.replace(/\x1B\[[0-9;]*[mK]/g, "");

        // save log to mongodb database using InternalLog
          try {
            InternalLog.create({
              logId: rid,
              type: logLevel,
              label: info?.label,
              message: info?.message,
            });
          } catch (error) {}
          
        // If request ID (rid) is available, include it in the log message or versa
        return rid
            ? `| ${info.timestamp} | ${rid} | ${info.label} | ${info.message} |`
            : `| ${info.timestamp} | ${info.label} | ${info.message} |`;
        })
      ),
      transports: [
        new transports.Console({
          //silent: process.env.NODE_ENV === "development"
        }),
      ],
      exitOnError: false,
    });
  
module.exports = logger;