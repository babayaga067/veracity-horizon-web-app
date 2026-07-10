import { z } from "zod";
export declare const CreateUserDTO: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
export declare const LoginUserDTO: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
//# sourceMappingURL=user.dto.d.ts.map