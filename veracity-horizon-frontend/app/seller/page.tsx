"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { handleGetMyAuctions, handleGetMyBids } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import type { Auction } from "@/app/lib/types/auction";

export default function SellerDashboardPage() {
  const { user, loading } = useAuthRedirect();
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [myBids, setMyBids] = useState<Auction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [auctionsRes, bidsRes] = await Promise.all([
        handleGetMyAuctions(),
        handleGetMyBids(),
      ]);
      if (auctionsRes.success && auctionsRes.data) {
        setMyAuctions(auctionsRes.data);
      }
      if (bidsRes.success && bidsRes.data) {
        setMyBids(bidsRes.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load seller dashboard");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRevenue = useMemo(() => {
    return myAuctions
      .filter((a) => a.status === "closed")
      .reduce((sum, a) => sum + (a.currentBid || a.startingPrice || 0), 0);
  }, [myAuctions]);

  const totalBidsPlaced = useMemo(() => {
    return myAuctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0);
  }, [myAuctions]);

  const avgBidValue = useMemo(() => {
    if (totalBidsPlaced === 0) return 0;
    return Math.round(totalRevenue / totalBidsPlaced);
  }, [totalRevenue, totalBidsPlaced]);

  const activeAuctions = useMemo(() => {
    return myAuctions.filter((a) => a.status === "active" || a.status === "open").length;
  }, [myAuctions]);

  const wonAuctions = useMemo(() => {
    return myBids.filter((a) => {
      const highest = a.bids?.sort((x, y) => y.amount - x.amount)[0];
      if (!highest) return false;
      const bidUserId = typeof highest.user === "object" ? highest.user?._id : highest.user;
      return bidUserId === user?._id;
    }).length;
  }, [myBids, user]);

  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    myAuctions.forEach((a) => {
      map[a.category] = (map[a.category] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [myAuctions]);

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c[1]), 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="fixed top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl float pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl float-delayed pointer-events-none"></div>

      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Seller Dashboard</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Track your auction performance and revenue</p>
          </div>

          {error && (
            <div className="glass-card border border-red-200/50 rounded-2xl p-5 text-red-800 text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-bold">{error}</p>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0a9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Revenue</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Total Revenue</p>
            </div>

            <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">Listings</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{myAuctions.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Total Auctions</p>
            </div>

            <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">Active</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{activeAuctions}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Active Auctions</p>
            </div>

            <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Won</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{wonAuctions}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Bids Won</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card rounded-3xl border border-white/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 bg-white/30">
                <h2 className="text-lg font-bold text-slate-900">Auction Performance</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Category distribution of your listings</p>
              </div>
              <div className="p-6 space-y-4">
                {categoryStats.length > 0 ? (
                  categoryStats.map((cat) => (
                    <div key={cat[0]}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-600 truncate pr-2 font-medium">{cat[0]}</span>
                        <span className="text-xs font-bold text-slate-900">{cat[1]}</span>
                      </div>
                      <div className="w-full bg-slate-100/80 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${(cat[1] / maxCategoryCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No category data available</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-3xl border border-white/50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/30">
                    <span className="text-sm text-slate-600 font-medium">Total Bids Received</span>
                    <span className="font-bold text-slate-900">{totalBidsPlaced}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-white/30">
                    <span className="text-sm text-slate-600 font-medium">Avg. Bid Value</span>
                    <span className="font-bold text-slate-900">{formatCurrency(avgBidValue)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-white/30">
                    <span className="text-sm text-slate-600 font-medium">Active Listings</span>
                    <span className="font-bold text-slate-900">{activeAuctions}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-600 font-medium">Bids Won</span>
                    <span className="font-bold text-slate-900">{wonAuctions}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-3xl border border-white/50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Auctions</h3>
                <div className="space-y-3">
                  {myAuctions.slice(0, 5).map((auction) => (
                    <Link key={auction._id} href={`/dashboard/auctions/${auction._id}`} className="block glass-card rounded-2xl border border-white/50 p-3 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                          {imageUrl((auction.imageUrls as string[] | undefined)?.[0]) ? (
                            <Image src={imageUrl((auction.imageUrls as string[] | undefined)?.[0])!} alt={auction.title} width={48} height={48} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate text-sm group-hover:text-blue-600 transition-colors">{auction.title}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {myAuctions.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No auctions yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}