"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { handleGetMyAuctions, handleGetMyBids } from "@/app/lib/actions/auth-actions";
import { AuctionCard } from "@/app/(auth)/_components/AuctionCard";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { SkeletonCardCompact } from "@/app/(auth)/_components/SkeletonCard";
import CreateAuctionForm from "@/app/(auth)/_components/CreateAuctionForm";

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
};

export default function PortfolioPage() {
  const { user, loading } = useAuthRedirect();
  const [myBids, setMyBids] = useState<Auction[]>([]);
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
      console.log("[Portfolio] bidsResult:", bidsResult);
      console.log("[Portfolio] auctionsResult:", auctionsResult);
      if (bidsResult.success && bidsResult.data) {
        setMyBids(bidsResult.data as Auction[]);
      }
      if (auctionsResult.success && auctionsResult.data) {
        setMyAuctions(auctionsResult.data as Auction[]);
      }
      if (!bidsResult.success || !auctionsResult.success) {
        setError(bidsResult.message || auctionsResult.message || "Failed to load portfolio data");
      }
    } catch (err) {
      console.error("[Portfolio] fetchData error:", err);
      setError(err instanceof Error ? err.message : "Failed to load portfolio data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
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
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4 text-red-700 text-sm">
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
              className="btn-primary px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Auction
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
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
                    <AuctionCard key={item._id} auction={item} compact />
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
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
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full my-8 shadow-2xl border border-gray-100">
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
