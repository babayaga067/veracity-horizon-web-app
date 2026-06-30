import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const AdminCreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
  role: true,
});
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial().pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
  role: true,
  profileImage: true,
  fullName: true,
  phoneNumber: true,
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
