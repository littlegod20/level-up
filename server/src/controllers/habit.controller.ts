import { Request, Response } from "express";
import { asyncHandler } from "@utils/async-handler";
import * as habitService from "@services/habit.service";

function userId(req: Request): string {
  return req.user!.id;
}

export const listHabits = asyncHandler(async (req: Request, res: Response) => {
  const data = await habitService.listHabits(userId(req));
  res.json({ habits: data });
});

export const getHabit = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params as { habitId: string };
  const data = await habitService.getHabit(userId(req), habitId);
  res.json({ habit: data });
});

export const createHabit = asyncHandler(async (req: Request, res: Response) => {
  const data = await habitService.createHabit(userId(req), req.body);
  res.status(201).json({ habit: data });
});

export const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params as { habitId: string };
  const data = await habitService.updateHabit(userId(req), habitId, req.body);
  res.json({ habit: data });
});

export const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params as { habitId: string };
  await habitService.deleteHabit(userId(req), habitId);
  res.status(204).send();
});
