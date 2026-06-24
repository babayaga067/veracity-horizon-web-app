"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, updatePasswordSchema } from "@/app/(auth)/_components/schema";
import { handleUpdateProfile, handleUpdatePassword } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { type User } from "@/app/lib/context/AuthContext";

type ProfileFormData = {
  firstName?: string;
  lastName?: string;
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: File;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const { user, loading, setUser } = useAuthRedirect();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const [profileStatus, setProfileStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileStatus(null);
    const formData = new FormData();
    if (data.firstName) formData.append("firstName", data.firstName);
    if (data.lastName) formData.append("lastName", data.lastName);
    if (data.username) formData.append("username", data.username);
    if (data.fullName) formData.append("fullName", data.fullName);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    const result = await handleUpdateProfile(formData);
    if (result.success) {
      setProfileStatus({ message: "Profile updated successfully", type: "success" });
      if (result.data) {
        setUser(result.data as unknown as User);
      }
    } else {
      setProfileStatus({ message: result.message || "Update failed", type: "error" });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordStatus(null);
    const result = await handleUpdatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    if (result.success) {
      setPasswordStatus({ message: "Password updated successfully", type: "success" });
      resetPassword();
    } else {
      setPasswordStatus({ message: result.message || "Password update failed", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-4xl w-full mx-auto px-8 py-8 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage your profile and security settings</p>
          </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider ${
              activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider ${
              activeTab === "password" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
          >
            Password
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              {profileStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                  profileStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  <p className="text-sm font-medium">{profileStatus.message}</p>
                </div>
              )}

              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-600">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={profileImageRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProfileImageFile(file);
                    }}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    {...registerProfile("firstName")}
                    placeholder="First name"
                    disabled={profileSubmitting}
                    className={`w-full px-4 py-3.5 rounded-xl border ${profileErrors.firstName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
                  />
                  {profileErrors.firstName && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.firstName.message}</span>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    {...registerProfile("lastName")}
                    placeholder="Last name"
                    disabled={profileSubmitting}
                    className={`w-full px-4 py-3.5 rounded-xl border ${profileErrors.lastName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
                  />
                  {profileErrors.lastName && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.lastName.message}</span>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                <input
                  id="username"
                  type="text"
                  {...registerProfile("username")}
                  placeholder="Username"
                  disabled={profileSubmitting}
                  className={`w-full px-4 py-3.5 rounded-xl border ${profileErrors.username ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
                />
                {profileErrors.username && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.username.message}</span>}
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  {...registerProfile("fullName")}
                  placeholder="Full name"
                  disabled={profileSubmitting}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {profileErrors.fullName && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.fullName.message}</span>}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  {...registerProfile("phoneNumber")}
                  placeholder="Phone number"
                  disabled={profileSubmitting}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {profileErrors.phoneNumber && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.phoneNumber.message}</span>}
              </div>

              <button
                type="submit"
                disabled={profileSubmitting}
                className="btn-primary w-full py-3.5 px-4 text-base font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {profileSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
              {passwordStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                  passwordStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  <p className="text-sm font-medium">{passwordStatus.message}</p>
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  {...registerPassword("currentPassword")}
                  placeholder="Enter current password"
                  disabled={passwordSubmitting}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {passwordErrors.currentPassword && <span className="text-xs text-red-600 font-medium mt-1.5 block">{passwordErrors.currentPassword.message}</span>}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  {...registerPassword("newPassword")}
                  placeholder="Enter new password"
                  disabled={passwordSubmitting}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {passwordErrors.newPassword && <span className="text-xs text-red-600 font-medium mt-1.5 block">{passwordErrors.newPassword.message}</span>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword("confirmPassword")}
                  placeholder="Confirm new password"
                  disabled={passwordSubmitting}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {passwordErrors.confirmPassword && <span className="text-xs text-red-600 font-medium mt-1.5 block">{passwordErrors.confirmPassword.message}</span>}
              </div>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="btn-primary w-full py-3.5 px-4 text-base font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {passwordSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}