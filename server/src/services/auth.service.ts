import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { appConfig } from "@config/app.config";
import { AppDataSource } from "@config/database.config";
import { User } from "@entities/user.entity";
import { AppError } from "@utils/app-error";

function signToken(user: User): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    appConfig.jwt.secret,
    { expiresIn: appConfig.jwt.expiresIn } as SignOptions
  );
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string
): Promise<{ user: { id: string; email: string }; accessToken: string }> {
  const repo = AppDataSource.getRepository(User);
  const normalized = email.trim().toLowerCase();
  const existing = await repo.findOne({ where: { email: normalized } });
  if (existing) {
    throw new AppError("Email already registered", 409, "EMAIL_TAKEN");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = repo.create({ email: normalized, passwordHash, firstName, lastName, dateOfBirth });
  await repo.save(user);
  return {
    user: { id: user.id, email: user.email },
    accessToken: signToken(user),
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: { id: string; email: string }; accessToken: string }> {
  const repo = AppDataSource.getRepository(User);
  const normalized = email.trim().toLowerCase();
  const user = await repo.findOne({ where: { email: normalized } });
  if (!user) {
    throw new AppError("Invalid email or password", 401, "AUTH_FAILED");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid email or password", 401, "AUTH_FAILED");
  }
  return {
    user: { id: user.id, email: user.email },
    accessToken: signToken(user),
  };
}
