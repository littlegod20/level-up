import { NextFunction, Request, Response } from "express";
import logger from "@config/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        query: req.query,
        body: req.body,
    });
    next();
}

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        query: req.query,
        body: req.body,
        error: err.message,
    });
    next();
}