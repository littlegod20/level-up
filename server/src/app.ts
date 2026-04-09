import { errorLogger, requestLogger } from "@middleware/logging";
import express, {type Application} from "express"
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { appConfig } from "@config/app.config";
import cors from "cors";
import statusMonitor from "express-status-monitor";

export const createApp = () => {
    const app:Application = express();

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
    });
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
   
    app.use(cors(appConfig.cors))
    app.use(requestLogger)
    app.use(helmet())

    app.use(statusMonitor())
    
    app.use("/api/v1",rateLimit(appConfig.basicRateLimit))
    app.use("/auth",rateLimit(appConfig.authRateLimit))

    app.use(errorLogger)

    app.use((_req, res)=> {
        res.status(404).json({message: 'Resource Not Found'});
    })

    return app;
}