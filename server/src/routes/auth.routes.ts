import { Router } from "express";
import * as authController from "@controllers/auth.controller";
import { validateBody } from "@middleware/validate.middleware";
import { loginSchema, registerSchema } from "@dtos/auth.dto";

const r = Router();

r.post("/register", validateBody(registerSchema), authController.register);
r.post("/login", validateBody(loginSchema), authController.login);

export default r;
