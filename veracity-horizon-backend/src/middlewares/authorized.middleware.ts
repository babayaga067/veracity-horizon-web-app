import { Request, Response, NextFunction } from "express";
import { SECRET_KEY } from "../configs/constant";
import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { UserMongoRepository } from "../repositories/user.repository";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}

const userRepository = new UserMongoRepository();

export const authorizedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new HttpException(401, "Unauthorized JWT invalid");
      }

      const token = authHeader.split(" ")[1];
      if (!token) throw new HttpException(401, "Unauthorized JWT missing");

      const decodedToken = jwt.verify(token, SECRET_KEY) as { id: string };
      if (!decodedToken?.id) {
        throw new HttpException(401, "Unauthorized JWT unverified");
      }

      const user = await userRepository.getUserById(decodedToken.id);
      if (!user) throw new HttpException(401, "Unauthorized user not found");

      req.user = user;
      return next();
    } catch (err) {
      const error = err as { name?: string; message?: string; status?: number };
      if (error.name === "TokenExpiredError") {
        return ApiResponseHelper.error(res, "JWT expired", 401);
      }
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  })();
};

// Optional: remove if you don’t need admin roles
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new HttpException(401, "Unauthorized no user info");
    if (req.user.role !== "admin") {
      throw new HttpException(403, "Forbidden not admin");
    }
    return next();
  } catch (error) {
    if (error instanceof HttpException) {
      return ApiResponseHelper.error(res, error.message, error.status);
    }
    return ApiResponseHelper.error(res, "Internal Server Error", 500);
  }
};
