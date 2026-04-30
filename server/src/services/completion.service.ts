import { AppDataSource } from "@config/database.config";
import { Habit } from "@entities/habit.entity";
import { Completion } from "@entities/completion.entity";
import { AppError } from "@utils/app-error";
import { completionToJson } from "@mappers/completion.mapper";
import type { CreateCompletionInput } from "@dtos/completion.dto";
import { QueryFailedError } from "typeorm";
import type { ListCompletionsQuery } from "@dtos/completion.dto";

async function getOwnedHabitOrThrow(
  userId: string,
  habitId: string
): Promise<Habit> {
  const repo = AppDataSource.getRepository(Habit);
  const h = await repo.findOne({ where: { id: habitId, userId } });
  if (!h) {
    throw new AppError("Habit not found", 404, "NOT_FOUND");
  }
  return h;
}

export async function listCompletions(
  userId: string,
  habitId: string,
  query: ListCompletionsQuery
): Promise<ReturnType<typeof completionToJson>[]> {
  await getOwnedHabitOrThrow(userId, habitId);
  const repo = AppDataSource.getRepository(Completion);
  const qb = repo
    .createQueryBuilder("c")
    .where("c.habitId = :habitId", { habitId })
    .andWhere("c.userId = :userId", { userId })
    .orderBy("c.completionDate", "DESC");

  if (query.from && query.to) {
    qb.andWhere("c.completionDate BETWEEN :from AND :to", {
      from: query.from,
      to: query.to,
    });
  } else if (query.from) {
    qb.andWhere("c.completionDate >= :from", { from: query.from });
  } else if (query.to) {
    qb.andWhere("c.completionDate <= :to", { to: query.to });
  }

  const rows = await qb.getMany();
  return rows.map(completionToJson);
}

export async function createCompletion(
  userId: string,
  habitId: string,
  input: CreateCompletionInput
): Promise<ReturnType<typeof completionToJson>> {
  const habit = await getOwnedHabitOrThrow(userId, habitId);
  const skipped = input.skipped ?? false;
  const xpAwarded = skipped ? 0 : habit.xpReward;
  const repo = AppDataSource.getRepository(Completion);
  const row = repo.create({
    userId,
    habitId: habit.id,
    completionDate: input.date,
    completedAt: new Date(),
    skipped,
    note: input.note ?? null,
    xpAwarded,
  });
  try {
    await repo.save(row);
  } catch (e) {
    if (e instanceof QueryFailedError) {
      const pe = e as { code?: string };
      if (pe.code === "23505") {
        throw new AppError(
          "Completion already exists for this date",
          409,
          "DUPLICATE"
        );
      }
    }
    throw e;
  }
  return completionToJson(row);
}

export async function deleteCompletion(
  userId: string,
  habitId: string,
  date: string
): Promise<void> {
  await getOwnedHabitOrThrow(userId, habitId);
  const repo = AppDataSource.getRepository(Completion);
  const c = await repo.findOne({
    where: { habitId, userId, completionDate: date },
  });
  if (!c) {
    throw new AppError("Completion not found", 404, "NOT_FOUND");
  }
  await repo.remove(c);
}
