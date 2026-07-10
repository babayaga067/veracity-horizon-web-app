import { z } from "zod";
export declare const UserSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        admin: "admin";
        user: "user";
    }>>;
}, z.core.$strip>;
export type UserType = z.infer<typeof UserSchema>;
//# sourceMappingURL=user.type.d.ts.map