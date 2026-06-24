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
            <StatsCard title="Total Auctions" value={auctions.length} subtitle="All listings" icon="📦" color="blue" trend={{ value: 12, label: "vs last week" }} />
            <StatsCard title="Active Now" value={activeCount} subtitle="Live bidding" icon="🔥" color="emerald" trend={{ value: 8, label: "vs last week" }} />
            <StatsCard title="Total Bids" value={totalBids} subtitle="Across all auctions" icon="💰" color="indigo" />
            <StatsCard title="My Listings" value={myListings} subtitle="Your auctions" icon="👤" color="amber" />
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
                    {featured.isFeatured ? "⭐ FEATURED AUCTION" : "🔥 ACTIVE NOW"}
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
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Recent Auctions</h3>
                <p className="text-sm text-slate-500">Latest listings across all categories</p>
              </div>
              <Link href="/dashboard/auctions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View all →
              </Link>
            </div>
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : auctions.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {auctions.slice(0, 4).map((item) => (
                  <AuctionCard key={item._id} auction={item} showImage={false} compact />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📭"
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
