import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
export declare class UserService {
    createUser(userData: CreateUserDTO): Promise<IUser>;
    loginUser(loginData: LoginUserDTO): Promise<{
        user: IUser;
        token: string;
    }>;
    getCurrentUser(id: string): Promise<IUser | null>;
    logoutUser(): Promise<boolean>;
    updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
    getAllUsers(page?: number, limit?: number, search?: string): Promise<{
        users: IUser[];
        total: number;
        totalPages: number;
    }>;
    updatePassword(id: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<IUser | null>;
}
//# sourceMappingURL=user.service.d.ts.map