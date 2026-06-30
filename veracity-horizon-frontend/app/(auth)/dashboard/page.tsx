"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { fetchAuctionsAction } from "@/app/lib/actions/auction-action";
import { handleGetMyBids } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import type { Auction } from "@/app/lib/types/auction";

export default function DashboardPage() {
  const { user, loading } = useAuthRedirect();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [myBids, setMyBids] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [auctionsRes, bidsRes] = await Promise.all([
        fetchAuctionsAction(1, 100),
        handleGetMyBids(),
      ]);
      if (auctionsRes.success && auctionsRes.data) {
        setAuctions(auctionsRes.data.data);
      }
      if (bidsRes.success && bidsRes.data) {
        setMyBids(bidsRes.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeCount = auctions.filter(a => a.status === "active" || a.status === "open").length;
  const totalBids = auctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0);
  const myListings = user ? auctions.filter(a => a.owner?._id === user._id).length : 0;

  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    auctions.forEach(a => {
      map[a.category] = (map[a.category] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [auctions]);

  const maxCategoryCount = Math.max(...categoryStats.map(c => c.count), 1);

  const recentMyBids = useMemo(() => {
    return [...myBids]
      .sort((a, b) => {
        const dateA = a.bids && a.bids.length > 0 ? new Date(a.bids[a.bids.length - 1].timestamp).getTime() : 0;
        const dateB = b.bids && b.bids.length > 0 ? new Date(b.bids[b.bids.length - 1].timestamp).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [myBids]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Here&apos;s what&apos;s happening in your auctions today.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{auctions.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total Auctions</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-xs text-gray-500 mt-1">Active Auctions</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0a9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Bids</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalBids}</p>
              <p className="text-xs text-gray-500 mt-1">Total Bids Placed</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">You</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{myListings}</p>
              <p className="text-xs text-gray-500 mt-1">My Listings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Recent Auctions</h3>
                    <p className="text-sm text-slate-500 mt-1">Latest listings across all categories</p>
                  </div>
                  <Link href="/market" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View all
                  </Link>
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
                    {auctions.slice(0, 8).map((item) => (
                      <div key={item._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                          {imageUrl((item.imageUrls as string[] | undefined)?.[0]) ? (
                            <Image src={imageUrl((item.imageUrls as string[] | undefined)?.[0])!} alt={item.title} fill className="object-cover" />
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
                              <p className="text-xs text-slate-400">Current</p>
                              <p className="text-sm font-bold text-slate-900">{formatCurrency(item.currentBid || item.startingPrice)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === "active" || item.status === "open" ? "bg-emerald-50 text-emerald-700" :
                              item.status === "closed" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"
                            }`}>
                              {(item.status || "upcoming").toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item.bids?.length || 0} bids
                            </span>
                          </div>
                        </div>
                        <Link href={`/dashboard/auctions/${item._id}`} className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex-shrink-0">
                          View
                        </Link>
                      </div>
                    ))}
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

              {recentMyBids.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-slate-900">Your Recent Bids</h3>
                    <p className="text-sm text-slate-500 mt-1">Latest bidding activity across auctions</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {recentMyBids.map((auction) => {
                      const myBid = auction.bids?.find(b => {
                        const bidUserId = typeof b.user === "object" ? b.user?._id : b.user;
                        return bidUserId === user?._id;
                      });
                      return (
                        <div key={auction._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                            {imageUrl((auction.imageUrls as string[] | undefined)?.[0]) ? (
                              <Image src={imageUrl((auction.imageUrls as string[] | undefined)?.[0])!} alt={auction.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate text-sm">{auction.title}</p>
                            <p className="text-xs text-slate-500">Your bid: {myBid ? formatCurrency(myBid.amount) : "N/A"}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-slate-400">Current</p>
                            <p className="text-sm font-bold text-slate-900">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                          </div>
                          <Link href={`/dashboard/auctions/${auction._id}`} className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex-shrink-0">
                            View
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/dashboard/auctions/create" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 text-sm">Create Auction</span>
                      <p className="text-xs text-slate-500">Start a new listing</p>
                    </div>
                  </Link>
                  <Link href="/market" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 text-sm">Browse Market</span>
                      <p className="text-xs text-slate-500">Explore all auctions</p>
                    </div>
                  </Link>
                  <Link href="/portfolio" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2m14 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h-9" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 text-sm">My Portfolio</span>
                      <p className="text-xs text-slate-500">View bids & activity</p>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories</h3>
                {categoryStats.length > 0 ? (
                  <div className="space-y-3">
                    {categoryStats.map((cat) => (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-600 truncate pr-2">{cat.name}</span>
                          <span className="text-xs font-semibold text-slate-900">{cat.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No category data available</p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-slate-600">Total Auctions</span>
                    <span className="font-semibold text-slate-900">{auctions.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-slate-600">Active Bids</span>
                    <span className="font-semibold text-slate-900">{totalBids}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-slate-600">Your Listings</span>
                    <span className="font-semibold text-slate-900">{myListings}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">Bids Won</span>
                    <span className="font-semibold text-slate-900">
                      {myBids.filter(a => {
                        const highest = a.bids?.sort((x, y) => y.amount - x.amount)[0];
                        if (!highest) return false;
                        const bidUserId = typeof highest.user === "object" ? highest.user?._id : highest.user;
                        return bidUserId === user?._id;
                      }).length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
