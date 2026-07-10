import { z } from "zod";

export const registerSchema = z.object({
    email: z.string({ message: "Invalid email address" }).email("Invalid email address"),
    firstName: z.string({ message: "Firstname must be string" })
        .min(2, "First name must be at least 2 characters long"),
    lastName: z.string({ message: "Last name must be string" })
        .min(2, "Last name must be at least 2 characters long"),
    username: z.string({ message: "Username must be string" })
        .min(3, "Username must be at least 3 characters long"),
    password: z.string({ message: "Password must be string" })
        .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string({ message: "Confirm Password must be string" })
        .min(6, "Confirm Password must be at least 6 characters long")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
    firstName: z.string({ message: "First name must be a string" }).min(2, "First name must be at least 2 characters").optional(),
    lastName: z.string({ message: "Last name must be a string" }).min(2, "Last name must be at least 2 characters").optional(),
    username: z.string({ message: "Username must be a string" }).min(3, "Username must be at least 3 characters").optional(),
    fullName: z.string({ message: "Full name must be a string" }).optional(),
    phoneNumber: z.string({ message: "Phone number must be a string" }).optional(),
  });

export const updatePasswordSchema = z.object({
    currentPassword: z.string({ message: "Current password is required" }).min(6, "Current password is required"),
    newPassword: z.string({ message: "New password must be at least 6 characters" }).min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string({ message: "Confirm password is required" }).min(6, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export const createAuctionSchema = z.object({
  title: z.string({ message: "Title must be a string" }).min(3, "Title must be at least 3 characters"),
  description: z.string({ message: "Description must be a string" }).min(10, "Description must be at least 10 characters"),
  startingPrice: z.number({ message: "Starting price must be a number" }).min(1, "Starting price must be at least 1"),
  category: z.enum([
    "Art",
    "Electronics",
    "Vehicles",
    "Collectibles",
    "Fashion",
    "Real Estate",
    "Textiles",
    "Jewelry",
    "Antiques",
    "Food & Spices",
    "Handicrafts",
    "Musical Instruments",
    "Books & Manuscripts",
    "Furniture",
    "Sports & Gear",
    "Home & Living",
    "Industrial Equipment",
    "Luxury Goods",
    "Agriculture & Livestock",
    "Tools & Hardware",
    "Ceramics & Pottery",
    "Carpets & Rugs",
    "Coins & Currency",
    "Watches & Timepieces",
    "Photography",
    "Sculptures",
    "Paintings",
    "Textbooks & Academic",
    "Outdoor & Adventure",
    "Health & Wellness",
    "Office Supplies",
    "Children & Toys",
    "Cultural Heritage",
    "Religious Items",
    "Digital Assets"
  ]),
  endsAt: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  status: z.enum(["upcoming", "active", "closed", "open"]).optional(),
  isFeatured: z.boolean().optional(),
});

export type CreateAuctionFormData = z.infer<typeof createAuctionSchema>;