import { z } from "zod";

// Shared definitions
export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  accessKey: z.string().min(6, "Access Key must be at least 6 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid institutional email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // Clean, flawless boolean refinement method
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Provenance Protocol",
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;