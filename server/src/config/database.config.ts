import "reflect-metadata";
import { DataSource } from "typeorm";
import { appConfig } from "./app.config";
import logger from "./logger";
import { User } from "../entities/user.entity";
import { Habit } from "../entities/habit.entity";
import { Completion } from "../entities/completion.entity";
import { InitialSchema1744000000000 } from "../migrations/1744000000000-InitialSchema";
import { AddUserProfileFields1746118200000 } from "../migrations/1746118200000-AddUserProfileFields";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: false,
  logging: false,
  entities: [User, Habit, Completion],
  migrations: [InitialSchema1744000000000, AddUserProfileFields1746118200000],
});


export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Error connecting to database", error);
    throw error;
  }
};
