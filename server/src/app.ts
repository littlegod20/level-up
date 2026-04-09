import { errorLogger, requestLogger } from "@middleware/logging";
import express, {type Application} from "express"
import helmet from "helmet";
import { appConfig } from "@config/app.config";
import cors from "cors";

export const createApp = () => {
    const app:Application = express();

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
    });
   
    app.use(cors(appConfig.cors))
    app.use(requestLogger)
    app.use(helmet())

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))


    app.use(errorLogger)

    app.use((_req, res)=> {
        res.status(404).json({message: 'Resource Not Found'});
    })

    return app;
}