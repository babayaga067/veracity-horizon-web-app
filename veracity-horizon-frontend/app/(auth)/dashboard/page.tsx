"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { getAuctions, getFeaturedAuctions } from "@/app/lib/api/auctions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { StatsCard } from "@/app/(auth)/_components/StatsCard";
import { AuctionCard } from "@/app/(auth)/_components/AuctionCard";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { SkeletonCard } from "@/app/(auth)/_components/SkeletonCard";
import { formatCurrency } from "@/app/lib/utils/currency";

type Auction = {
  _id: string;
  title: string;
  description?: string;
  startingPrice: number;
  currentBid?: number;
  category: "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate";
  isFeatured: boolean;
  status: "upcoming" | "active" | "closed" | "open";
  endsAt: Date | string;
  imageUrls: string[];
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  bids?: { user: string; amount: number; timestamp: Date }[];
};

export default function DashboardPage() {
  const { user, loading } = useAuthRedirect();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [featured, setFeatured] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allRes, featuredRes] = await Promise.all([
        getAuctions(),
        getFeaturedAuctions()
      ]);
      if (allRes.success) {
        const data = allRes.data;
        setAuctions(data);
        setFeatured(featuredRes.success && featuredRes.data.length > 0 ? featuredRes.data[0] : data[0] || null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const activeCount = auctions.filter(a => a.status === "active" || a.status === "open").length;
  const totalBids = auctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0);
  const myListings = user ? auctions.filter(a => a.owner?._id === user._id).length : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Here&apos;s what&apos;s happening in your auctions today.</p>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4 text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold">Connection Error</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Auctions" value={auctions.length} subtitle="All listings" icon="package" color="blue" trend={{ value: 12, label: "vs last week" }} />
            <StatsCard title="Active Now" value={activeCount} subtitle="Live bidding" icon="zap" color="emerald" trend={{ value: 8, label: "vs last week" }} />
            <StatsCard title="Total Bids" value={totalBids} subtitle="Across all auctions" icon="dollar" color="indigo" />
            <StatsCard title="My Listings" value={myListings} subtitle="Your auctions" icon="user" color="amber" />
          </div>

          {/* Featured Auction */}
          {featured && !isLoading && (
            <div className="relative rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-800 to-blue-900"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] bg-white/10 backdrop-blur-sm text-blue-300 font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                    {featured.isFeatured ? "Featured Auction" : "Active Now"}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">{featured.title}</h2>
                    <p className="text-sm text-slate-300 mt-3 line-clamp-2">{featured.description || "Premium auction item"}</p>
                    <div className="flex items-center gap-6 mt-6">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Current Bid</p>
                        <p className="text-2xl font-bold text-white mt-0.5">{formatCurrency(featured.currentBid || featured.startingPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Category</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{featured.category}</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/auctions/${featured._id}`}
                      className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                    >
                      View Auction
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                    {featured.imageUrls?.[0] && (
                      <div className="hidden lg:block">
                        <img
                          src={featured.imageUrls[0]}
                          alt={featured.title}
                          className="w-full h-64 object-cover rounded-2xl shadow-2xl"
                        />
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Recent Auctions */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-slate-900">Recent Auctions</h3>
              <p className="text-sm text-slate-500 mt-1">Latest listings across all categories</p>
            </div>
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : auctions.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {auctions.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.imageUrls?.[0] ? (
                        <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-400">Starting</p>
                          <p className="text-sm font-bold text-slate-900">रु {item.startingPrice}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === "active" || item.status === "open" ? "bg-emerald-50 text-emerald-700" :
                      item.status === "closed" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                    <Link href={`/dashboard/auctions/${item._id}`} className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
                      View
                    </Link>
                  </div>
                ))}
                {auctions.length > 5 && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <Link href="/dashboard/auctions" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      View all {auctions.length} auctions →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon="box"
                title="No auctions yet"
                description="Start by creating your first auction listing to see it here."
                actionLabel="Create Auction"
                actionHref="/market"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
