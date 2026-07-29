"use client";

import { useState, useEffect } from "react";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { getWonAuctionsAction } from "@/app/lib/actions/auction-action";
import { AuctionCard } from "@/app/(auth)/_components/AuctionCard";
import { SkeletonCard } from "@/app/(auth)/_components/SkeletonCard";
import type { Auction } from "@/app/lib/types/auction";
import type { PaginationMeta } from "@/app/lib/types/pagination";

export default function WonAuctionsPage() {
  const { loading } = useAuthRedirect();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      const result = await getWonAuctionsAction(page);
      if (!cancelled && result.success && result.data) {
        setAuctions(result.data as Auction[]);
        setMeta(result.meta as PaginationMeta);
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [page]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Won Auctions</h1>
          <p className="text-slate-500">Auctions where you placed the highest bid.</p>
        </div>

        <div className="glass-card rounded-2xl border border-amber-200 bg-amber-50/60 p-4 mb-8 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <circle cx="12" cy="11" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Collect from our office</p>
            <p className="text-xs text-amber-700 mt-1">Won auctions can be collected from our office during business hours. Please bring your ID and the auction confirmation.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (<SkeletonCard key={i} />))}
          </div>
        ) : auctions.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <p className="text-slate-500 mb-4">You haven&apos;t won any auctions yet.</p>
            <a href="/market" className="btn-primary inline-block px-6 py-3 text-sm font-bold rounded-xl">Browse Marketplace</a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline px-4 py-2 rounded-xl disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">Page {meta.page} of {meta.totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="btn-outline px-4 py-2 rounded-xl disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
