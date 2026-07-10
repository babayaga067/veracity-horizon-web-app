import { Request, Response, NextFunction } from "express";
export declare class AdminUserController {
    createUser(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    updateUser(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    deleteUser(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    listUsers(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getUserById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=user.controller.d.ts.map