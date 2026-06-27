"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, updatePasswordSchema } from "@/app/(auth)/_components/schema";
import { handleUpdateProfile, handleUpdatePassword, handleGetMyAuctions, handleGetMyBids } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { type User } from "@/app/lib/context/AuthContext";
import imageCompression from "browser-image-compression";

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
  const [activeTab, setActiveTab] = useState<"profile" | "auctions" | "bids" | "password">("profile");
  const [auctions, setAuctions] = useState<
    Array<{
      _id: string;
      title: string;
      status: string;
      startingPrice: number;
      bids?: { amount: number }[];
      imageUrls?: string[];
    }>
  >([]);
  const [bids, setBids] = useState<
    Array<{
      _id: string;
      amount: number;
      timestamp: Date | string;
      auction?: {
        _id: string;
        title?: string;
        imageUrls?: string[];
        status?: string;
      };
    }>
  >([]);
  const [statsLoading, setStatsLoading] = useState(true);

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      const [auctionRes, bidRes] = await Promise.all([
        handleGetMyAuctions(),
        handleGetMyBids(),
      ]);
      if (auctionRes.success && auctionRes.data) {
        setAuctions(auctionRes.data);
      }
      if (bidRes.success && bidRes.data) {
        setBids(bidRes.data);
      }
      setStatsLoading(false);
    };
    if (user) {
      fetchStats();
    }
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
      const options: imageCompression.Options = { maxSizeMB: 1, maxWidthOrHeight: 400, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      setProfileImageFile(compressedFile);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(compressedFile);
    } catch {
      setProfileStatus({ message: "Failed to process image", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { label: "Active Auctions", value: auctions.filter((a) => a.status === "active" || a.status === "open").length, color: "blue" },
    { label: "Total Auctions", value: auctions.length, color: "indigo" },
    { label: "Total Bids", value: bids.length, color: "emerald" },
    { label: "Won Auctions", value: bids.filter((b) => b.status === "won").length, color: "amber" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Overview</h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">Manage your profile, auctions, and bids in one place</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                Member since {new Date().getFullYear()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                    <div className={`w-5 h-5 rounded bg-${stat.color}-500`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-b border-gray-200 mb-6">
            {(["profile", "auctions", "bids", "password"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "text-blue-600 border-b-3 border-blue-600 bg-blue-50/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab === "profile" && "Profile Settings"}
                {tab === "auctions" && "My Auctions"}
                {tab === "bids" && "My Bids"}
                {tab === "password" && "Security"}
              </button>
            ))}
          </div>

          {activeTab === "profile" && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Information</h2>

              {profileStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-3 mb-6 ${
                  profileStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  <p className="text-sm font-medium">{profileStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                      {imagePreview || user.profileImage ? (
                        <img src={imagePreview || user.profileImage} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-slate-600">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 mt-3 cursor-pointer">
                      Profile Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <span className="block mt-1 text-xs text-blue-600 font-medium">Change avatar</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                      <input
                        id="firstName"
                        type="text"
                        {...registerProfile("firstName")}
                        placeholder="First name"
                        disabled={profileSubmitting}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
                      />
                      {profileErrors.lastName && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.lastName.message}</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
                    />
                    {profileErrors.username && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.username.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      {...registerProfile("fullName")}
                      placeholder="Full name"
                      disabled={profileSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
                    />
                    {profileErrors.phoneNumber && <span className="text-xs text-red-600 font-medium mt-1.5 block">{profileErrors.phoneNumber.message}</span>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  {profileSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "auctions" && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">My Auctions</h2>
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : auctions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No auctions found. Create your first auction!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auctions.map((auction) => (
                    <div key={auction._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                        {auction.imageUrls?.[0] ? (
                          <img src={auction.imageUrls[0]} alt={auction.title} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{auction.title}</p>
                        <p className="text-sm text-slate-500">रु {auction.startingPrice} • {auction.bids?.length || 0} bids</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        auction.status === "active" || auction.status === "open" ? "bg-emerald-100 text-emerald-800" :
                        auction.status === "closed" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {auction.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bids" && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">My Bids</h2>
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : bids.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No bids placed yet. Start bidding on auctions!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                        {bid.auction?.imageUrls?.[0] ? (
                          <img src={bid.auction.imageUrls[0]} alt={bid.auction?.title || "Auction"} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{bid.auction?.title || "Auction"}</p>
                        <p className="text-sm text-slate-500">Bid: रु {bid.amount} • {new Date(bid.timestamp).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        bid.auction?.status === "closed" ? "bg-gray-100 text-gray-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {bid.auction?.status === "closed" ? "CLOSED" : "ACTIVE"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Change Password</h2>

              {passwordStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-3 mb-6 ${
                  passwordStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  <p className="text-sm font-medium">{passwordStatus.message}</p>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5 max-w-md">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    {...registerPassword("currentPassword")}
                    placeholder="Enter current password"
                    disabled={passwordSubmitting}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100"
                  />
                  {passwordErrors.confirmPassword && <span className="text-xs text-red-600 font-medium mt-1.5 block">{passwordErrors.confirmPassword.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60"
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