import { AppDataSource } from "@config/database.config";
import { Habit } from "@entities/habit.entity";
import { AppError } from "@utils/app-error";
import { habitToJson } from "@mappers/habit.mapper";
import type { CreateHabitInput, UpdateHabitInput } from "@dtos/habit.dto";

export async function listHabits(
  userId: string
): Promise<ReturnType<typeof habitToJson>[]> {
  const repo = AppDataSource.getRepository(Habit);
  const rows = await repo.find({
    where: { userId },
    order: { createdAt: "ASC" },
  });
  return rows.map(habitToJson);
}

export async function getHabit(
  userId: string,
  habitId: string
): Promise<ReturnType<typeof habitToJson>> {
  const repo = AppDataSource.getRepository(Habit);
  const h = await repo.findOne({ where: { id: habitId, userId } });
  if (!h) {
    throw new AppError("Habit not found", 404, "NOT_FOUND");
  }
  return habitToJson(h);
}

export async function createHabit(
  userId: string,
  input: CreateHabitInput
): Promise<ReturnType<typeof habitToJson>> {
  const repo = AppDataSource.getRepository(Habit);
  const h = repo.create({
    userId,
    name: input.name,
    icon: input.icon,
    color: input.color,
    frequency: input.frequency,
    customWeekdays:
      input.frequency === "custom" ? (input.customWeekdays ?? null) : null,
    reminderTime: input.reminderTime ?? null,
    xpReward: input.xpReward,
    archived: input.archived ?? false,
  });
  await repo.save(h);
  return habitToJson(h);
}

export async function updateHabit(
  userId: string,
  habitId: string,
  input: UpdateHabitInput
): Promise<ReturnType<typeof habitToJson>> {
  const repo = AppDataSource.getRepository(Habit);
  const h = await repo.findOne({ where: { id: habitId, userId } });
  if (!h) {
    throw new AppError("Habit not found", 404, "NOT_FOUND");
  }
  if (input.name !== undefined) h.name = input.name;
  if (input.icon !== undefined) h.icon = input.icon;
  if (input.color !== undefined) h.color = input.color;
  if (input.frequency !== undefined) h.frequency = input.frequency;
  if (input.frequency === "custom" && input.customWeekdays !== undefined) {
    h.customWeekdays = input.customWeekdays;
  }
  if (input.frequency !== undefined && input.frequency !== "custom") {
    h.customWeekdays = null;
  }
  if (input.customWeekdays !== undefined && h.frequency === "custom") {
    h.customWeekdays = input.customWeekdays;
  }
  if (input.reminderTime !== undefined) h.reminderTime = input.reminderTime;
  if (input.xpReward !== undefined) h.xpReward = input.xpReward;
  if (input.archived !== undefined) h.archived = input.archived;
  await repo.save(h);
  return habitToJson(h);
}

export async function deleteHabit(
  userId: string,
  habitId: string
): Promise<void> {
  const repo = AppDataSource.getRepository(Habit);
  const h = await repo.findOne({ where: { id: habitId, userId } });
  if (!h) {
    throw new AppError("Habit not found", 404, "NOT_FOUND");
  }
  await repo.remove(h);
}
