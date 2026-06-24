import { z } from "zod";

export const CreateAuctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startingPrice: z.number().min(1, "Starting price must be at least 1"),
  category: z.enum(["Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate"]),
  endsAt: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
});

export type CreateAuctionDTO = z.infer<typeof CreateAuctionSchema>;
