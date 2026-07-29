"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { handleGetMyBids } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { SkeletonCard } from "@/app/(auth)/_components/SkeletonCard";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import type { Auction } from "@/app/lib/types/auction";
import type { PaginationMeta } from "@/app/lib/types/pagination";

export default function BidHistoryPage() {
  const { user, loading } = useAuthRedirect();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const fetchBids = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await handleGetMyBids();
      if (result.success && result.data) {
        setAuctions(result.data);
        setPagination({ page, limit: 12, total: result.data.length, totalPages: 1 });
      } else {
        setAuctions([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bid history");
      setAuctions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handlePageChange = (page: number) => {
    fetchBids(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const wonCount = useMemo(() => {
    return auctions.filter((a) => {
      const highest = a.bids?.sort((x, y) => y.amount - x.amount)[0];
      if (!highest) return false;
      const bidUserId = typeof highest.user === "object" ? highest.user?._id : highest.user;
      return bidUserId === user?._id;
    }).length;
  }, [auctions, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="fixed top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl float pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float-delayed pointer-events-none" />

      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bid History</h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">Track all your bids across auctions</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-3xl border border-white/50 p-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Bids</p>
              <p className="text-3xl font-bold text-slate-900">{auctions.length}</p>
            </div>
            <div className="glass-card rounded-3xl border border-white/50 p-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Auctions Won</p>
              <p className="text-3xl font-bold text-emerald-600">{wonCount}</p>
            </div>
            <div className="glass-card rounded-3xl border border-white/50 p-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Active Bids</p>
              <p className="text-3xl font-bold text-blue-600">{auctions.filter(a => a.status === "active" || a.status === "open").length}</p>
            </div>
            <div className="glass-card rounded-3xl border border-white/50 p-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Lost Bids</p>
              <p className="text-3xl font-bold text-slate-500">{auctions.length - wonCount}</p>
            </div>
          </div>

          {error && (
            <div className="glass-card border border-red-200/50 rounded-2xl p-5 text-red-700 text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-bold">{error}</p>
              </div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)
            ) : auctions.length > 0 ? (
              auctions.map((item) => {
                const myBid = item.bids?.find(b => {
                  const bidUserId = typeof b.user === "object" ? b.user?._id : b.user;
                  return bidUserId === user?._id;
                });
                const sortedBids = item.bids?.sort((a, b) => b.amount - a.amount);
                const highestBid = sortedBids?.[0];
                const isWon = myBid && highestBid && String(highestBid.user) === String(user?._id);
                const isOutbid = myBid && !isWon && highestBid && highestBid.amount > (myBid.amount || 0);

                return (
                  <div key={item._id} className="glass-card rounded-3xl border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 bg-slate-100">
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <Image src={imageUrl(item.imageUrls[0])!} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          item.status === "active" || item.status === "open" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                          item.status === "closed" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}>
                          {isWon ? "Won" : isOutbid ? "Outbid" : item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-xs text-slate-400">Your Bid</p>
                          <p className="text-lg font-bold text-slate-900">{myBid ? formatCurrency(myBid.amount) : "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Current</p>
                          <p className="text-lg font-bold text-slate-900">{formatCurrency(item.currentBid || item.startingPrice)}</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/auctions/${item._id}`} className="block mt-4 text-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        View Auction
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon="search"
                title="No bids yet"
                description="Start bidding on auctions to see your bid history here."
                actionLabel="Browse Auctions"
                actionHref="/market"
              />
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-slate-500 font-medium">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bids
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        pageNum === pagination.page
                          ? "bg-blue-600 text-white"
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}