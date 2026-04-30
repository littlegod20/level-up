import { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import logger from "@config/logger";
import { AppError } from "@utils/app-error";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      issues: err.flatten().fieldErrors,
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message, code: err.code });
    return;
  }
  if (err instanceof QueryFailedError) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      res
        .status(409)
        .json({ message: "Resource already exists", code: "CONFLICT" });
      return;
    }
  }
  logger.error("Unhandled error", { err, path: req.originalUrl });
  res.status(500).json({ message: "Internal server error" });
}
