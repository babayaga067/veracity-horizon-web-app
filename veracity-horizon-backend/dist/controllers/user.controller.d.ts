import { Request, Response, NextFunction } from "express";
export declare class UserController {
    createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    loginUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    logoutUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    whoami(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    uploadProfileImage(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    updatePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=user.controller.d.ts.map