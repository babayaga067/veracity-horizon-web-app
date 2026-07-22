import { z } from "zod";

const BaseUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().optional(),
  fullName: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const createUserSchema = BaseUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateUserSchema = BaseUserSchema;

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
