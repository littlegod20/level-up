import { NextFunction, Request, Response } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { AppError } from "@utils/app-error";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body) as T;
      req.body = parsed;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          issues: e.flatten().fieldErrors,
        });
        return;
      }
      next(new AppError("Invalid request body", 400));
    }
  };
}
