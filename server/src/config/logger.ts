import path from "node:path";
import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file";
import { appConfig } from "./app.config";

const {printf, combine, timestamp, errors, colorize} = winston.format

const consoleFormat = printf(({level, message, timestamp, stack, ...meta})=>{
    let log = `${timestamp} [${level}]: ${stack ?? message}`;
    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta)}`;
    }
    return log;
})

const fileFormat = printf(({level, message, timestamp, stack, ...meta})=>{
    const log = {
        timestamp,
        level,
        message,
        stack,
        ...meta
    }
    return JSON.stringify(log);
})

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

const logger = winston.createLogger({
    level: appConfig.logging.level,
    levels,
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        errors({stack: true}),
    ),
    transports: [
        // console logs
        new winston.transports.Console({
            format: combine(colorize(), consoleFormat),
        }),

        // application logs
        new DailyRotateFile({
            filename: path.join(__dirname, "../../logs/application-%DATE%.log"),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),

        // error logs
        new DailyRotateFile({
            level: 'error',
            filename: path.join(__dirname, "../../logs/error-%DATE%.log"),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        })
    ],

    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(__dirname, "../../logs/exceptions-%DATE%.log"),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        })
    ]
})

export default logger;