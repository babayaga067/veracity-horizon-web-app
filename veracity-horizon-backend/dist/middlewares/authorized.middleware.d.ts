import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";
declare global {
    namespace Express {
        interface Request {
            user?: IUser | null;
        }
    }
}
export declare const authorizedMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=authorized.middleware.d.ts.map