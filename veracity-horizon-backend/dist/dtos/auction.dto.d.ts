import { z } from "zod";
export declare const CreateAuctionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    startingPrice: z.ZodNumber;
    category: z.ZodEnum<{
        Art: "Art";
        Electronics: "Electronics";
        Vehicles: "Vehicles";
        Collectibles: "Collectibles";
        Fashion: "Fashion";
        "Real Estate": "Real Estate";
    }>;
    endsAt: z.ZodOptional<z.ZodString>;
    imageUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type CreateAuctionDTO = z.infer<typeof CreateAuctionSchema>;
//# sourceMappingURL=auction.dto.d.ts.map