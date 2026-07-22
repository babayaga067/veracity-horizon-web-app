"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createUserSchema, updateUserSchema, type CreateUserFormData, type UpdateUserFormData } from "./userSchema";
import type { User } from "@/app/lib/types/user";
import { createAdminUser, updateAdminUser } from "@/app/lib/actions/admin-user-action";

interface UserFormProps {
  mode: "create" | "edit";
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UserForm({ mode, user, onSuccess, onCancel }: UserFormProps) {
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" | null } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(mode === "create" ? createUserSchema : updateUserSchema),
    defaultValues: user || { firstName: "", lastName: "", email: "", username: "" },
  });

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setStatus(null);
    startTransition(async () => {
      if (mode === "create") {
        const result = await createAdminUser(data as CreateUserFormData);
        if (result.success) {
          setStatus({ message: "User created successfully", type: "success" });
          reset();
          onSuccess?.();
        } else {
          setStatus({ message: result.message || "Failed to create user", type: "error" });
        }
      } else if (mode === "edit" && user?._id) {
        const result = await updateAdminUser(user._id, data as UpdateUserFormData);
        if (result.success) {
          setStatus({ message: "User updated successfully", type: "success" });
          onSuccess?.();
        } else {
          setStatus({ message: result.message || "Failed to update user", type: "error" });
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === "create" ? "Create New User" : "Edit User"}
      </h2>

      {status && (
        <div className={`p-4 rounded-xl mb-4 ${status.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              placeholder="First name"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
            />
            {errors.firstName && <span className="text-xs text-red-600 mt-1">{errors.firstName.message}</span>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              placeholder="Last name"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
            />
            {errors.lastName && <span className="text-xs text-red-600 mt-1">{errors.lastName.message}</span>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="email@example.com"
            disabled={isPending}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
          />
          {errors.email && <span className="text-xs text-red-600 mt-1">{errors.email.message}</span>}
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
          <input
            id="username"
            type="text"
            {...register("username")}
            placeholder="Username"
            disabled={isPending}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
          />
          {errors.username && <span className="text-xs text-red-600 mt-1">{errors.username.message}</span>}
        </div>

        {mode === "create" && (
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              {...register("password" as const)}
              placeholder="Password"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
            />
          </div>
        )}

        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
          <select
            id="role"
            {...register("role")}
            disabled={isPending}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3.5 px-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isPending ? (mode === "create" ? "Creating..." : "Updating...") : (mode === "create" ? "Create User" : "Update User")}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="px-6 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
