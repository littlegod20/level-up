import { Request, Response } from "express";
import * as authService from "@services/auth.service";
import { asyncHandler } from "@utils/async-handler";
import { RegisterInput, LoginInput } from "@dtos/auth.dto";

export const register = asyncHandler(
  async (req: Request<object, object, RegisterInput>, res: Response) => {
    const { email, password, firstName, lastName, dateOfBirth } = req.body;
    const out = await authService.register(email, password, firstName, lastName, dateOfBirth);
    res.status(201).json({
      accessToken: out.accessToken,
      user: out.user,
    });
  }
);

export const login = asyncHandler(
  async (req: Request<object, object, LoginInput>, res: Response) => {
    const { email, password } = req.body;
    const out = await authService.login(email, password);
    res.json({
      accessToken: out.accessToken,
      user: out.user,
    });
  }
);
