import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@utils/async-handler";
import * as completionService from "@services/completion.service";
import { listCompletionsQuerySchema } from "@dtos/completion.dto";

function userId(req: Request): string {
  return req.user!.id;
}

export const listCompletions = asyncHandler(
  async (req: Request, res: Response) => {
    const { habitId } = req.params as { habitId: string };
    const q = listCompletionsQuerySchema.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({
        message: "Invalid query",
        issues: q.error.flatten().fieldErrors,
      });
      return;
    }
    const data = await completionService.listCompletions(
      userId(req),
      habitId,
      q.data
    );
    res.json({ completions: data });
  }
);

export const createCompletion = asyncHandler(
  async (req: Request, res: Response) => {
    const { habitId } = req.params as { habitId: string };
    const data = await completionService.createCompletion(
      userId(req),
      habitId,
      req.body
    );
    res.status(201).json({ completion: data });
  }
);

const paramDate = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "date param must be YYYY-MM-DD"
  );

export const deleteCompletion = asyncHandler(
  async (req: Request, res: Response) => {
    const { habitId } = req.params as { habitId: string };
    const date = paramDate.parse((req.params as { date: string }).date);
    await completionService.deleteCompletion(userId(req), habitId, date);
    res.status(204).send();
  }
);
