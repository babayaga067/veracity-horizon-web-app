"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { handleGetMyAuctions, handleGetMyBids } from "@/app/lib/actions/auth-actions";
import { AuctionCard } from "@/app/(auth)/_components/AuctionCard";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { SkeletonCardCompact } from "@/app/(auth)/_components/SkeletonCard";
import CreateAuctionForm from "@/app/(auth)/_components/CreateAuctionForm";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import type { Auction } from "@/app/lib/types/auction";

type BidItem = {
  _id: string;
  amount: number;
  timestamp: Date | string;
  auction: {
    _id: string;
    title: string;
    startingPrice: number;
    imageUrls?: string[];
    status?: string;
    currentBid?: number;
  };
};

function extractUserBids(auctions: Auction[], userId: string): BidItem[] {
  if (!userId) return [];
  const bidItems: BidItem[] = [];
  for (const auction of auctions) {
    if (!auction.bids) continue;
    for (const bid of auction.bids) {
      const bidUserId = typeof bid.user === "object" && bid.user?._id ? bid.user._id : bid.user;
      if (bidUserId === userId) {
        bidItems.push({
          _id: auction._id,
          amount: bid.amount,
          timestamp: bid.timestamp,
          auction: {
            _id: auction._id,
            title: auction.title,
            startingPrice: auction.startingPrice,
            imageUrls: auction.imageUrls,
            status: auction.status,
            currentBid: auction.currentBid,
          },
        });
      }
    }
  }
  return bidItems;
}

export default function PortfolioPage() {
  const { user, loading } = useAuthRedirect();
  const [myBids, setMyBids] = useState<BidItem[]>([]);
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [bidsResult, auctionsResult] = await Promise.all([
        handleGetMyBids(),
        handleGetMyAuctions(),
      ]);
      if (bidsResult.success && bidsResult.data) {
        const bidItems = extractUserBids(bidsResult.data as Auction[], user._id);
        setMyBids(bidItems);
      }
      if (auctionsResult.success && auctionsResult.data) {
        setMyAuctions(auctionsResult.data as Auction[]);
      }
      if (!bidsResult.success || !auctionsResult.success) {
        setError(bidsResult.message || auctionsResult.message || "Failed to load portfolio data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Run async safely without triggering React's sync-render warnings
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await fetchData();
    };

    run();

    return () => {
      mounted = false;
    };
  }, [fetchData]);



  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold">Error loading portfolio</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">Track your investments and auction activity</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Auction
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Your Bids</h2>
                  <p className="text-sm text-slate-500">Auctions you&apos;ve placed bids on</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  {myBids.length} active
                </span>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <SkeletonCardCompact />
                  <SkeletonCardCompact />
                </div>
                ) : myBids.length > 0 ? (
                <div className="space-y-3">
                  {myBids.map((item) => (
                    <Link key={`${item._id}-${item.amount}-${item.timestamp}`} href={`/dashboard/auctions/${item.auction._id}`} className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group">
                       <div className="flex gap-4">
                          {imageUrl((item.auction.imageUrls as string[] | undefined)?.[0]) ? (
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                              <Image src={imageUrl((item.auction.imageUrls as string[] | undefined)?.[0])!} alt={item.auction.title || "Auction"} width={80} height={80} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                           </div>
                         ) : (
                           <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                             <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                             </svg>
                           </div>
                         )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.auction.title || "Auction"}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {item.auction.status?.toUpperCase() || "ACTIVE"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                            Your bid: {formatCurrency(item.amount)}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-slate-900">{formatCurrency(item.auction.currentBid || item.auction.startingPrice)}</span>
                            <span className="text-xs text-slate-400">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="dollar"
                  title="No bids yet"
                  description="Browse the market and place your first bid."
                  actionLabel="Browse Market"
                  actionHref="/market"
                />
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Your Auctions</h2>
                  <p className="text-sm text-slate-500">Items you&apos;ve listed for auction</p>
                </div>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <SkeletonCardCompact />
                  <SkeletonCardCompact />
                </div>
              ) : myAuctions.length > 0 ? (
                <div className="space-y-3">
                  {myAuctions.map((item) => (
                    <AuctionCard key={item._id} auction={item} compact />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="box"
                  title="No auctions yet"
                  description="Create your first auction to start selling."
                  actionLabel="Create Auction"
                  onAction={() => setShowCreateModal(true)}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full my-8 shadow-2xl border border-gray-200">
            <CreateAuctionForm
              onSuccess={() => {
                setShowCreateModal(false);
                fetchData();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}