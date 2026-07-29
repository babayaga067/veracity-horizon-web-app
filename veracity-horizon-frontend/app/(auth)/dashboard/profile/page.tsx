"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, updatePasswordSchema } from "@/app/(auth)/_components/schema";
import { handleUpdateProfile, handleUpdatePassword, handleGetMyAuctions, handleGetMyBids, handleLogout } from "@/app/lib/actions/auth-actions";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { type User } from "@/app/lib/context/AuthContext";
import { type Auction } from "@/app/lib/types/auction";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import { useDarkMode } from "@/app/(auth)/_components/DarkModeToggle";

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

function formatDate(date: Date | string | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function resolveBidUserId(bid: NonNullable<Auction["bids"]>[number], userId: string): boolean {
  const bidUserId = typeof bid.user === "object" && bid.user !== null && "_id" in bid.user ? (bid.user as { _id: string })._id : bid.user;
  return bidUserId === userId;
}

export default function ProfilePage() {
  const { user, loading, setUser } = useAuthRedirect();
  const { isDark } = useDarkMode();
  const [profileStatus, setProfileStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [auctionCount, setAuctionCount] = useState<number>(0);
  const [myBids, setMyBids] = useState<Auction[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "bids">("profile");

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: profileSubmitting }, reset: resetProfile } = useForm<ProfileFormData>({ resolver: zodResolver(updateProfileSchema), defaultValues: { firstName: user?.firstName || "", lastName: user?.lastName || "", username: user?.username || "", fullName: user?.fullName || "", phoneNumber: user?.phoneNumber || "" } });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting }, reset: resetPassword } = useForm<PasswordFormData>({ resolver: zodResolver(updatePasswordSchema) });

  useEffect(() => {
    if (user) { resetProfile({ firstName: user.firstName || "", lastName: user.lastName || "", username: user.username || "", fullName: user.fullName || "", phoneNumber: user.phoneNumber || "" }); }
  }, [user, resetProfile]);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const [auctionsRes, bidsRes] = await Promise.all([handleGetMyAuctions(), handleGetMyBids()]);
      const auctionCount = auctionsRes.success && auctionsRes.data ? auctionsRes.data.length : 0;
      const bids = bidsRes.success && bidsRes.data ? bidsRes.data : [];
      const winCount = bids.filter((a) => { const h = a.bids?.sort((x, y) => y.amount - x.amount)[0]; return h && String(h.user) === user?._id; }).length;
      const revenue = bids.filter((a) => a.status === "closed").reduce((sum, a) => sum + (a.currentBid || a.startingPrice || 0), 0);
      setAuctionCount(auctionCount);
      setMyBids(bids);
      setProfileStatus(null);
    } catch { setProfileStatus({ message: "Failed to load stats", type: "error" }); }
    finally { setIsLoadingStats(false); }
  }, [user]);

  useEffect(() => { if (user) fetchStats(); }, [user, fetchStats]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileStatus(null);
    const formData = new FormData();
    if (data.firstName) formData.append("firstName", data.firstName);
    if (data.lastName) formData.append("lastName", data.lastName);
    if (data.username) formData.append("username", data.username);
    if (data.fullName) formData.append("fullName", data.fullName);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (profileImageFile) formData.append("profileImage", profileImageFile);
    const result = await handleUpdateProfile(formData);
    if (result.success) {
      if (result.data) {
        setUser(result.data as unknown as User);
      }
      setProfileStatus({ message: result.message || "Profile updated successfully", type: "success" });
    } else {
      setProfileStatus({ message: result.message || "Update failed", type: "error" });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordStatus(null);
    const result = await handleUpdatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword, confirmPassword: data.confirmPassword });
    if (result.success) { setPasswordStatus({ message: result.message || "Password updated successfully", type: "success" }); resetPassword(); }
    else { setPasswordStatus({ message: result.message || "Password update failed", type: "error" }); }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    setProfileImageFile(null);
    setImagePreview(null);
  };

  const handleLogoutClick = async () => { await handleLogout(); window.location.href = "/login"; };

  const profileImageSrc = imagePreview || (user?.profileImage ? imageUrl(user.profileImage) : "");
  const initials = getInitials(user?.firstName, user?.lastName);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans antialiased text-slate-900 overflow-x-hidden">
      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-8 mb-8 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0 relative">
                {profileImageSrc ? (
                  <Image src={profileImageSrc} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.25h15.002c.966 0 1.75-.784 1.75-1.75v-7.5c0-1.192-.784-2.193-1.842-2.43a1.75 1.75 0 00-1.816 0c-.31.123-.662.178-1.018.178H6.076c-.356 0-.707-.055-1.018-.178A1.75 1.75 0 003.25 11.25v7.5c0 .966.784 1.75 1.75 1.75z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">{user.fullName || `${user.firstName} ${user.lastName}`}</h1>
                <p className="text-indigo-200 text-sm mt-1 font-medium">@{user.username}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">{user.role === "admin" ? "Administrator" : "Member"}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">{user.isVerified ? "Verified" : "Unverified"}</span>
                </div>
              </div>
              <button onClick={handleLogoutClick} className="px-5 py-2.5 text-sm font-bold text-white border border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all flex-shrink-0">Logout</button>
            </div>
          </div>

          {profileStatus && (
            <div className={`glass-card p-4 rounded-xl border mb-6 ${profileStatus.type === "success" ? "border-emerald-200/50 bg-emerald-50/50" : "border-red-200/50 bg-red-50/50"}`}>
              <p className="text-sm font-medium">{profileStatus.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Auctions", value: isLoadingStats ? "..." : auctionCount, icon: "grid", color: "blue" },
              { label: "Bids Placed", value: isLoadingStats ? "..." : myBids.length, icon: "hand", color: "indigo" },
              { label: "Wins", value: isLoadingStats ? "..." : myBids.filter((a) => { const h = a.bids?.sort((x, y) => y.amount - x.amount)[0]; return h && String(h.user) === user?._id; }).length, icon: "trophy", color: "amber" },
              { label: "Revenue", value: isLoadingStats ? "..." : formatCurrency(myBids.filter((a) => a.status === "closed").reduce((s, a) => s + (a.currentBid || a.startingPrice || 0), 0)), icon: "dollar", color: "emerald" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl border border-white/50 p-5 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-white/10" : "bg-blue-50 text-blue-600"}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      {stat.icon === "grid" && <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />}
                      {stat.icon === "hand" && <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0 0h3m-3 0h3m-3 0h1.5M19 11.5V14m0 0h-3m3 0h-3m3 0h1.5M12 11.5V14m0 0h3m-3 0h3M12 11.5V14m0 0h-3m3 0h-3" />}
                      {stat.icon === "trophy" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                      {stat.icon === "dollar" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0a9 9 0 0118 0z" />}
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1 mb-6 border-b border-slate-200/50 pb-0">
            {[{ id: "profile" as const, label: "Profile" }, { id: "security" as const, label: "Security" }, { id: "bids" as const, label: "Recent Bids" }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all ${activeTab === tab.id ? "bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 border-b-2 border-transparent"}`}>{tab.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="glass-card rounded-3xl border border-white/50 overflow-hidden sticky top-8">
                <div className="p-6 text-center bg-gradient-to-b from-white to-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Quick Links</h3>
                  <p className="text-sm text-slate-500">Frequently used actions</p>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/market" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all group"><div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div><span className="text-sm font-medium text-slate-700">Browse Market</span></Link>
                  <Link href="/dashboard/auctions/create" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all group"><div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg></div><span className="text-sm font-medium text-slate-700">Create Auction</span></Link>
                  <Link href="/dashboard/bids" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all group"><div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><span className="text-sm font-medium text-slate-700">Bid History</span></Link>
                  <Link href="/portfolio" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all group"><div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2m14 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h-9" /></svg></div><span className="text-sm font-medium text-slate-700">My Portfolio</span></Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {activeTab === "profile" && (
                <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/10 bg-white/30">
                    <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Update your photo and personal details</p>
                  </div>
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-8 space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/50 shadow-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0 relative">
                        {profileImageSrc ? (
                          <Image src={profileImageSrc} alt="Profile" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.25h15.002c.966 0 1.75-.784 1.75-1.75v-7.5c0-1.192-.784-2.193-1.842-2.43a1.75 1.75 0 00-1.816 0c-.31.123-.662.178-1.018.178H6.076c-.356 0-.707-.055-1.018-.178A1.75 1.75 0 003.25 11.25v7.5c0 .966.784 1.75 1.75 1.75z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <input id="profileImage" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        <label htmlFor="profileImage" className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" /></svg>
                          Change Photo
                        </label>
                        {profileImageFile && (
                          <button type="button" onClick={clearSelectedImage} className="text-xs text-red-600 font-semibold hover:text-red-700">Remove</button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-2">First Name</label><input id="firstName" type="text" {...registerProfile("firstName")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{profileErrors.firstName && <span className="text-xs text-red-600 mt-1.5 block font-medium">{profileErrors.firstName.message}</span>}</div>
                      <div><label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-2">Last Name</label><input id="lastName" type="text" {...registerProfile("lastName")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{profileErrors.lastName && <span className="text-xs text-red-600 mt-1.5 block font-medium">{profileErrors.lastName.message}</span>}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label><input id="email" type="email" value={user.email} disabled className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/30 text-sm text-slate-500 cursor-not-allowed" /></div>
                      <div><label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">Username</label><input id="username" type="text" {...registerProfile("username")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{profileErrors.username && <span className="text-xs text-red-600 mt-1.5 block font-medium">{profileErrors.username.message}</span>}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2">Full Name</label><input id="fullName" type="text" {...registerProfile("fullName")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{profileErrors.fullName && <span className="text-xs text-red-600 mt-1.5 block font-medium">{profileErrors.fullName.message}</span>}</div>
                      <div><label htmlFor="phoneNumber" className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label><input id="phoneNumber" type="tel" {...registerProfile("phoneNumber")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{profileErrors.phoneNumber && <span className="text-xs text-red-600 mt-1.5 block font-medium">{profileErrors.phoneNumber.message}</span>}</div>
                    </div>
                    <div className="pt-4 border-t border-white/30 flex items-center gap-4">
                      <button type="submit" disabled={profileSubmitting} className="btn-primary px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">{profileSubmitting ? "Saving..." : "Save Changes"}</button>
                      <button type="button" onClick={() => resetProfile({ firstName: user.firstName || "", lastName: user.lastName || "", username: user.username || "", fullName: user.fullName || "", phoneNumber: user.phoneNumber || "" })} className="btn-outline px-6 py-3 text-sm font-bold rounded-xl">Reset</button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "security" && (
                <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/10 bg-white/30">
                    <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Update your password to keep your account secure</p>
                  </div>
                  {passwordStatus && <div className={`px-8 pt-4 ${passwordStatus.type === "success" ? "text-emerald-700" : "text-red-700"}`}><p className="text-sm font-medium">{passwordStatus.message}</p></div>}
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-8 space-y-5">
                    <div><label htmlFor="currentPassword" className="block text-sm font-bold text-slate-700 mb-2">Current Password</label><input id="currentPassword" type="password" {...registerPassword("currentPassword")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{passwordErrors.currentPassword && <span className="text-xs text-red-600 mt-1.5 block font-medium">{passwordErrors.currentPassword.message}</span>}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div><label htmlFor="newPassword" className="block text-sm font-bold text-slate-700 mb-2">New Password</label><input id="newPassword" type="password" {...registerPassword("newPassword")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{passwordErrors.newPassword && <span className="text-xs text-red-600 mt-1.5 block font-medium">{passwordErrors.newPassword.message}</span>}</div>
                      <div><label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label><input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />{passwordErrors.confirmPassword && <span className="text-xs text-red-600 mt-1.5 block font-medium">{passwordErrors.confirmPassword.message}</span>}</div>
                    </div>
                    <div className="pt-3 border-t border-white/30"><button type="submit" disabled={passwordSubmitting} className="btn-primary px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">{passwordSubmitting ? "Updating..." : "Update Password"}</button></div>
                  </form>
                </div>
              )}

              {activeTab === "bids" && (
                <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/10 bg-white/30">
                    <h2 className="text-lg font-bold text-slate-900">Recent Bids</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Your latest bidding activity</p>
                  </div>
                  <div className="p-6">
                    {isLoadingStats ? (
                      <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                    ) : myBids.length > 0 ? (
                      <div className="space-y-3">
                        {myBids.slice(0, 10).map((auction) => {
                          const myBid = auction.bids?.find((b) => resolveBidUserId(b, user._id));
                          return (
                            <Link key={auction._id} href={`/dashboard/auctions/${auction._id}`} className="flex items-center gap-4 p-4 rounded-xl border border-white/30 hover:bg-white/50 transition-all group">
                              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0a9 9 0 0118 0z" /></svg></div>
                              <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{auction.title}</p><p className="text-xs text-slate-500">Your bid: {formatCurrency(myBid?.amount || 0)}</p></div>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${auction.status === "active" || auction.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : auction.status === "closed" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-50 text-blue-700 border-blue-100"}`}>{(auction.status || "upcoming").toUpperCase()}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12"><svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0a9 9 0 0118 0z" /></svg><p className="text-sm font-medium text-slate-500">No bids placed yet</p><p className="text-xs text-slate-400 mt-1">Start bidding on auctions to see your activity here</p><Link href="/market" className="btn-primary inline-block mt-4 px-5 py-2.5 text-sm font-bold rounded-xl">Browse Auctions</Link></div>
                    )}
                  </div>
                </div>
              )}

              {user.role === "admin" && (
                <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/10 bg-white/30">
                    <h2 className="text-lg font-bold text-slate-900">Admin Panel</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage users and auctions</p>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/admin/users" className="flex items-center gap-4 p-4 border border-white/30 rounded-xl hover:bg-white/50 transition-all group"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.646 4 4 0 11-5.646-4l-.5.646zM22 17H2v5a2 2 0 002 2h16a2 2 0 002-2v-5z" /></svg></div><div><p className="font-bold text-slate-900 text-sm">User Management</p><p className="text-xs text-slate-500">Create, update, delete users</p></div></Link>
                    <Link href="/admin/auctions" className="flex items-center gap-4 p-4 border border-white/30 rounded-xl hover:bg-white/50 transition-all group"><div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" /></svg></div><div><p className="font-bold text-slate-900 text-sm">Auction Management</p><p className="text-xs text-slate-500">View and manage all auctions</p></div></Link>
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

export const dynamic = "force-dynamic";