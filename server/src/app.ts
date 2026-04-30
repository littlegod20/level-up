import { errorHandler } from "@middleware/error.middleware";
import { errorLogger, requestLogger } from "@middleware/logging";
import express, { type Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { appConfig } from "@config/app.config";
import cors from "cors";
import statusMonitor from "express-status-monitor";
import { swaggerUiServe, swaggerUiSetup } from "@config/swagger.config";
import { apiRouter, authRoutes } from "@routes/index";

export const createApp = () => {
  const app: Application = express();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use(cors(appConfig.cors));
  app.use(helmet());

  app.use(requestLogger);
  
  app.use(statusMonitor());
  
  app.use("/api-docs", swaggerUiServe, swaggerUiSetup);
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ message: "OK" });
  });
  
  app.use("/auth", rateLimit(appConfig.authRateLimit), authRoutes);
  app.use("/api", rateLimit(appConfig.basicRateLimit), apiRouter);
  
  app.use((_req, res) => {
    res.status(404).json({ message: "Resource Not Found" });
  });
  
  app.use(errorLogger)
  app.use(errorHandler);

  return app;
};
