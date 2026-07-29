import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "user"; 
  profileImage?: string;
  fullName?: string;
  phoneNumber?: string;
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserMongoSchema: Schema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    profileImage: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
  },

  { timestamps: true }
);

UserMongoSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserMongoSchema.index({ emailVerificationExpires: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { emailVerificationToken: { $exists: true } } });

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);
