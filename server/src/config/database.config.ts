import { DataSource } from "typeorm";
import { appConfig } from "./app.config";
import logger from "./logger";


export const AppDataSource = new DataSource({
    type: 'postgres',
    host: appConfig.database.host,
    port: appConfig.database.port,
    username: appConfig.database.username,
    password: appConfig.database.password,
    database: appConfig.database.database,
    synchronize: false,
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
})

export const initializeDatabase = async (): Promise<void> => {
    try{
        await AppDataSource.initialize();
        logger.info('Database connected successfully');

    } catch (error) {
        logger.error('Error connecting to database', error);
        throw error;
    }
} 