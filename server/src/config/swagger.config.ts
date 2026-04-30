import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { appConfig } from "./app.config";

const baseUrl =
  process.env.PUBLIC_API_URL?.replace(/\/$/, "") ||
  `http://localhost:${appConfig.port}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Level Up API",
      version: "1.0.0",
      description: "REST API for Level Up (habits, completions, auth).",
    },
    servers: [
      {
        url: baseUrl,
        description: "API base (set PUBLIC_API_URL in production)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
    },
  },
  apis: ["./src/routes/**/*.ts", "./src/docs/openapi-paths.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
    explorer: true,
});
