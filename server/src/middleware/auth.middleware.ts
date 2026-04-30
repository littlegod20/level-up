import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { appConfig } from "@config/app.config";

type JwtPayload = { sub: string; email: string; iat?: number; exp?: number };
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = h.slice(7);
  try {
    const payload = jwt.verify(
      token,
      appConfig.jwt.secret
    ) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
