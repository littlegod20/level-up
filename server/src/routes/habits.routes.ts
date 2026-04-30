import { Router } from "express";
import * as habitController from "@controllers/habit.controller";
import * as completionController from "@controllers/completion.controller";
import { validateBody } from "@middleware/validate.middleware";
import { createHabitSchema, updateHabitSchema } from "@dtos/habit.dto";
import { createCompletionSchema } from "@dtos/completion.dto";

const r = Router();

r.get("/", habitController.listHabits);
r.post("/", validateBody(createHabitSchema), habitController.createHabit);

r.get(
  "/:habitId/completions",
  completionController.listCompletions
);
r.post(
  "/:habitId/completions",
  validateBody(createCompletionSchema),
  completionController.createCompletion
);
r.delete(
  "/:habitId/completions/:date",
  completionController.deleteCompletion
);

r.get("/:habitId", habitController.getHabit);
r.patch(
  "/:habitId",
  validateBody(updateHabitSchema),
  habitController.updateHabit
);
r.delete("/:habitId", habitController.deleteHabit);

export default r;
