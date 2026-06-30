"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, updatePasswordSchema } from "@/app/(auth)/_components/schema";
import { handleUpdateProfile, handleUpdatePassword, handleGetMyAuctions, handleLogout } from "@/app/lib/actions/auth-actions";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { type User } from "@/app/lib/context/AuthContext";
import { imageUrl } from "@/app/lib/api/config";

type ProfileFormData = {
  firstName?: string;
  lastName?: string;
  username?: string;
  fullName?: string;
  phoneNumber?: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const { user, loading, setUser } = useAuthRedirect();
  const [profileStatus, setProfileStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [auctionCount, setAuctionCount] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
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
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const [auctionsRes] = await Promise.all([handleGetMyAuctions()]);
        if (auctionsRes.success && auctionsRes.data) {
          setAuctionCount(auctionsRes.data.length);
        }
      } catch {
      } finally {
        setIsLoadingStats(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

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
        setImagePreview(null);
        setProfileImageFile(null);
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 400, useWebWorker: true };
      const compressedFile = await import("browser-image-compression").then(mod => mod.default(file, options));
      setProfileImageFile(compressedFile);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(compressedFile);
    } catch {
      setProfileStatus({ message: "Failed to process image", type: "error" });
    }
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    window.location.href = "/login";
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-500 mt-1 text-sm">Manage your account information and preferences</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>

          {profileStatus && (
            <div className={`p-4 rounded-xl ${profileStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              <p className="text-sm font-medium">{profileStatus.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100 mx-auto relative">
                    {imagePreview || user.profileImage ? (
                      <Image
                        src={imagePreview || imageUrl(user.profileImage)!}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <span className="text-3xl font-bold text-blue-600">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-gray-900">{user.fullName || `${user.firstName} ${user.lastName}`}</h2>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <span className="inline-flex items-center mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {user.role === "admin" ? "Administrator" : "Member"}
                  </span>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600 truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                    </svg>
                    <span className="text-gray-600">{isLoadingStats ? "Loading..." : `${auctionCount ?? 0} Auction${auctionCount === 1 ? "" : "s"}`}</span>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100">
                  <label className="block text-xs font-medium text-blue-600 cursor-pointer hover:text-blue-700 text-center">
                    Change avatar
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Actions</h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/dashboard/auctions" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">My Auctions</p>
                      <p className="text-xs text-gray-500">Manage your listings</p>
                    </div>
                  </Link>
                  <Link href="/portfolio" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Portfolio</p>
                      <p className="text-xs text-gray-500">View bids & activity</p>
                    </div>
                  </Link>
                  <Link href="/market" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Marketplace</p>
                      <p className="text-xs text-gray-500">Browse all auctions</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your photo and personal details</p>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                      <input id="firstName" type="text" {...registerProfile("firstName")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {profileErrors.firstName && <span className="text-xs text-red-600 mt-1 block">{profileErrors.firstName.message}</span>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                      <input id="lastName" type="text" {...registerProfile("lastName")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {profileErrors.lastName && <span className="text-xs text-red-600 mt-1 block">{profileErrors.lastName.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <input id="email" type="email" value={user.email} disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                      <input id="username" type="text" {...registerProfile("username")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {profileErrors.username && <span className="text-xs text-red-600 mt-1 block">{profileErrors.username.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                      <input id="fullName" type="text" {...registerProfile("fullName")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {profileErrors.fullName && <span className="text-xs text-red-600 mt-1 block">{profileErrors.fullName.message}</span>}
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                      <input id="phoneNumber" type="tel" {...registerProfile("phoneNumber")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {profileErrors.phoneNumber && <span className="text-xs text-red-600 mt-1 block">{profileErrors.phoneNumber.message}</span>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button type="submit" disabled={profileSubmitting} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {profileSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
                </div>

                {passwordStatus && (
                  <div className={`px-6 pt-4 ${passwordStatus.type === "success" ? "text-green-700" : "text-red-700"}`}>
                    <p className="text-sm font-medium">{passwordStatus.message}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 space-y-5">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                    <input id="currentPassword" type="password" {...registerPassword("currentPassword")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                    {passwordErrors.currentPassword && <span className="text-xs text-red-600 mt-1 block">{passwordErrors.currentPassword.message}</span>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                      <input id="newPassword" type="password" {...registerPassword("newPassword")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {passwordErrors.newPassword && <span className="text-xs text-red-600 mt-1 block">{passwordErrors.newPassword.message}</span>}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                      <input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {passwordErrors.confirmPassword && <span className="text-xs text-red-600 mt-1 block">{passwordErrors.confirmPassword.message}</span>}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <button type="submit" disabled={passwordSubmitting} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {passwordSubmitting ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              {user.role === "admin" && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage users and auctions</p>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/admin/users" className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.646 4 4 0 11-5.646-4l-.5.646zM22 17H2v5a2 2 0 002 2h16a2 2 0 002-2v-5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">User Management</p>
                        <p className="text-xs text-gray-500">Create, update, delete users</p>
                      </div>
                    </Link>
                    <Link href="/admin/auctions" className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Auction Management</p>
                        <p className="text-xs text-gray-500">View and manage all auctions</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
