import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

interface RateLimitOptions {
    windowMs: number;
    max: number;
    keyPrefix: string;
    /** Defaults to a generic "too many requests" string in the constructor. */
    message?: string;
}


export class RateLimiter {
    private readonly windowMs: number;
    private readonly max: number;
    private readonly message: string;
    private readonly keyPrefix: string;

    constructor(options: RateLimitOptions){
        this.windowMs = options.windowMs
        this.max = options.max
        this.message = options.message ?? "Too many requests, please try again later.";
        this.keyPrefix = options.keyPrefix;
    }

    public middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const key = `${this.keyPrefix}:${req.ip}`;
          const current = await redis.incr(key);
    
          if (current === 1) {
            await redis.pexpire(key, this.windowMs);
          }
    
          res.setHeader('X-RateLimit-Limit', this.max);
          res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - current));
          res.setHeader('X-RateLimit-Reset', Math.ceil(this.windowMs / 1000));
    
          if (current > this.max) {
            throw new RateLimitError(this.message);
          }
    
          next();
        } catch (error) {
          next(error);
        }
      };
}

export const rateLimiters = {
    strict: new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per 15 minutes
      keyPrefix: 'rate-limit-strict',
      message: 'Too many attempts, please try again later.',
    }).middleware,
  
    standard: new RateLimiter({
      windowMs: 60 * 1000,
      max: 60,
      keyPrefix: 'rate-limit-standard',
    }).middleware,
  
    relaxed: new RateLimiter({
      windowMs: 60 * 1000,
      max: 120,
      keyPrefix: 'rate-limit-relaxed',
    }).middleware,
  
    otp: new RateLimiter({
      windowMs: 60 * 60 * 1000,
      max: 3,
      keyPrefix: 'rate-limit-otp',
      message: 'Too many OTP requests, please try again later.',
    }).middleware,
  };