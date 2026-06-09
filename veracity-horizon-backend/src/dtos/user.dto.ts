import { z } from "zod";
import { UserSchema } from "../types/user.type";

// DTO for creating a user (registration)
export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// DTO for login
export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
