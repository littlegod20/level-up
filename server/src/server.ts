import { appConfig } from "@config/app.config";
import { createApp } from "./app"
import http from "http"
import logger from "@config/logger";
import { initializeDatabase } from "@config/database.config";


const startServer = async(): Promise<void> => {
    try{
        logger.info('Initializing database connection...');
        await initializeDatabase();
        logger.info('Database connection initialized successfully');

        const app = createApp()
        const server = http.createServer(app);

        const port = appConfig.port

        server.listen(port, ()=>{
            logger.info(`Server is running on port ${port}`);
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