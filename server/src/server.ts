import { appConfig } from "@config/app.config";
import { createApp } from "./app"
import http from "http"
import logger from "@config/logger";
import { initializeDatabase } from "@config/database.config";


const startServer = async(): Promise<void> => {
    try{
        logger.info('Initializing database connection...');
        await initializeDatabase();

        const app = createApp()
        const server = http.createServer(app);

        const port = appConfig.port

        server.listen(port, ()=>{
            logger.info(
                `Server running in ${appConfig.env} mode on port ${appConfig.port}`
              );

              if (appConfig.env === "development") {
                logger.info(
                  `Status monitor: http://localhost:${appConfig.port}/status`
                );
              }
        
              logger.info(
                `Health check endpoint: http://localhost:${appConfig.port}/api/health`
              );
        })

        process.on('SIGTERM', ()=>{
            server.close(()=>{
                logger.info('Server is shutting down');
            })
        })
        process.on('SIGINT', ()=>{
            server.close(()=>{
                logger.info('Server is shutting down');
            })
        })
    } catch (error) {
        logger.error('Error starting server:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
}

startServer();