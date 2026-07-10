import { Response } from "express";
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface ApiResponse<T> {
    status: number;
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta | undefined;
}
export declare class ApiResponseHelper {
    static success<T>(res: Response, data: T, message?: string, status?: number, meta?: PaginationMeta): Response;
    static error(res: Response, message?: string, status?: number): Response;
}
//# sourceMappingURL=apihelper.util.d.ts.map