export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: "user" | "admin";
  profileImage?: string;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: Date | string;
};