import { Router } from "express";
import { requireAuth } from "@middleware/auth.middleware";
import authRoutes from "./auth.routes";
import habitsRoutes from "./habits.routes";

const apiRouter = Router();
apiRouter.use("/habits", requireAuth, habitsRoutes);
export { authRoutes, apiRouter };
