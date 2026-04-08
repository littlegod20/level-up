import { appConfig } from "@config/app.config";
import { createApp } from "./app"
import http from "http"


const startServer = async(): Promise<void> => {
    try{

        const app = createApp()
        const server = http.createServer(app);

        const port = appConfig.port

        server.listen(port, ()=>{
            console.log(`Server is running on port ${port}`);
        })

        process.on('SIGTERM', ()=>{
            server.close(()=>{
                console.log('Server is shutting down');
            })
        })
        process.on('SIGINT', ()=>{
            server.close(()=>{
                console.log('Server is shutting down');
            })
        })
    } catch (error) {
        console.error('Error starting server:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
}

startServer();