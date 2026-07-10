import type { IUser } from "../models/user.model";
export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAll(page?: number, limit?: number, search?: string): Promise<{
        users: IUser[];
        total: number;
        totalPages: number;
    }>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
}
export declare class UserMongoRepository implements IUserRepository {
    getUserById(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    getAll(page?: number, limit?: number, search?: string): Promise<{
        users: IUser[];
        total: number;
        totalPages: number;
    }>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=user.repository.d.ts.map