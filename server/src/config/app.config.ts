import {config} from 'dotenv'

config()

export const appConfig = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 86400 // 24hrs
    },
    authRateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: 'Too many requests, please try again later.',
    },
    logging:{
        level: process.env.LOG_LEVEL || 'info',
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'levelup',
    }
}