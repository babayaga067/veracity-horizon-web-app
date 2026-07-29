"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { fetchAuctionByIdAction, handlePlaceBid } from "@/app/lib/actions/auction-action";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { useToast } from "@/app/(auth)/_components/Toast";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import type { Auction } from "@/app/lib/types/auction";

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, loading } = useAuthRedirect();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidStatus, setBidStatus] = useState<{
    message: string;
    type: "success" | "error" | null;
  } | null>(null);
  const [isBidding, setIsBidding] = useState(false);
  const { addToast } = useToast();
  const { id } = use(params);

  const fetchAuction = useCallback(async (auctionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAuctionByIdAction(auctionId);
      if (result.success && result.data) {
        setAuction(result.data);
      } else {
        setError(result.message || "Auction not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load auction");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuction(id);
  }, [id, fetchAuction]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction?._id || !bidAmount) return;

    const amount = Number(bidAmount);
    if (amount <= 0) {
      setBidStatus({ message: "Bid amount must be positive", type: "error" });
      return;
    }

    setIsBidding(true);
    setBidStatus(null);

    const result = await handlePlaceBid(auction._id, amount);
    if (result.success) {
      setBidStatus({ message: "Bid placed successfully!", type: "success" });
      addToast("Bid placed successfully!", "success");
      setBidAmount("");
      const refreshed = await fetchAuctionByIdAction(auction._id);
      if (refreshed.success && refreshed.data) {
        setAuction(refreshed.data);
      }
    } else {
      setBidStatus({ message: result.message || "Failed to place bid", type: "error" });
      addToast(result.message || "Failed to place bid", "error");
    }
    setIsBidding(false);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeLeft = (endsAt: Auction["endsAt"]) => {
    if (!endsAt) return "No end date";
    const end = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getStatusColor = (status: Auction["status"]) => {
    switch (status) {
      case "active":
      case "open":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="fixed top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl float pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float-delayed pointer-events-none"></div>

      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10">
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
          <Link
            href="/dashboard/auctions"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Auctions
          </Link>

          {error && (
            <div className="glass-card border-2 border-red-200 rounded-2xl p-5 text-red-800">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-bold">{error}</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-64 bg-slate-100 rounded-2xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-24 bg-slate-100 rounded-xl" />
            </div>
          ) : auction ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(auction.status)}`}>
                    {(auction.status || "upcoming").toUpperCase()}
                  </span>
                  {auction.isFeatured && (
                    <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium">Ends</p>
                  <p className="text-lg font-bold text-slate-900">{getTimeLeft(auction.endsAt)}</p>
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{auction.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="font-medium">{auction.category}</span>
                <span className="text-slate-300">|</span>
                <span>by {auction.owner?.firstName} {auction.owner?.lastName}</span>
                <span className="text-slate-300">|</span>
                <span>{auction.bids?.length || 0} bid{auction.bids && auction.bids.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
                    <div className="relative h-80 bg-slate-100">
                      {auction.imageUrls && auction.imageUrls.length > 0 ? (
                        <Image
                          src={imageUrl(auction.imageUrls[0])!}
                          alt={auction.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {auction.imageUrls && auction.imageUrls.length > 1 && (
                      <div className="p-4 flex gap-3 overflow-x-auto">
                        {auction.imageUrls.slice(1).map((url, idx) => (
                          <div key={`img-${idx}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                            <Image src={imageUrl(url)!} alt={`Image ${idx + 2}`} width={80} height={80} className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass-card rounded-3xl border border-white/50 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
                    <p className="text-slate-600 leading-relaxed">{auction.description || "No description provided."}</p>
                  </div>

                  <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/30">
                      <h2 className="text-lg font-bold text-slate-900">Bid History</h2>
                    </div>
                    <div className="divide-y divide-white/30">
                      {auction.bids && auction.bids.length > 0 ? (
                        auction.bids
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((bid, idx) => {
                            const bidUser = typeof bid.user === "object" && bid.user !== null ? bid.user : { firstName: "Unknown", lastName: "" };
                            return (
                              <div key={`${bid.timestamp}-${idx}`} className="flex items-center justify-between px-6 py-4 hover:bg-white/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                    {(bidUser.firstName || "U")[0]}{(bidUser.lastName || "")[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{bidUser.firstName} {bidUser.lastName}</p>
                                    <p className="text-xs text-slate-500">{formatDate(bid.timestamp)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-slate-900">{formatCurrency(bid.amount)}</p>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          <p className="font-medium">No bids yet</p>
                          <p className="text-xs mt-1">Be the first to place a bid on this auction</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-3xl border border-white/50 p-6">
                    <div className="text-center mb-6">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Current Bid</p>
                      <p className="text-4xl font-bold text-slate-900">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                      <p className="text-xs text-slate-500 mt-1">Starting at {formatCurrency(auction.startingPrice)}</p>
                    </div>

                    {auction.owner && (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/30 bg-white/30 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {auction.owner.firstName[0]}{auction.owner.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{auction.owner.firstName} {auction.owner.lastName}</p>
                          <p className="text-xs text-slate-500">@{auction.owner.username}</p>
                        </div>
                      </div>
                    )}

                    {auction.status !== "closed" && auction.status !== "upcoming" && user && user._id !== auction.owner?._id && (
                      <form onSubmit={handleBidSubmit} className="space-y-4">
                        {bidStatus && (
                          <div className={`p-3 rounded-xl text-sm font-bold ${bidStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {bidStatus.message}
                          </div>
                        )}
                        <div>
                          <label htmlFor="bidAmount" className="block text-sm font-bold text-slate-700 mb-2">Your Bid (₹)</label>
                          <input
                            id="bidAmount"
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`Minimum: ${(auction.currentBid || auction.startingPrice) + 1}`}
                            min={(auction.currentBid || auction.startingPrice) + 1}
                            step="1"
                            disabled={isBidding}
                            className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isBidding || !bidAmount}
                          className="btn-primary w-full py-3 text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBidding ? "Placing Bid..." : "Place Bid"}
                        </button>
                      </form>
                    )}

                    {auction.status === "closed" && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <p className="text-sm font-bold text-slate-600">This auction has ended</p>
                      </div>
                    )}

                    {auction.status === "upcoming" && (
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                        <p className="text-sm font-bold text-blue-700">Auction has not started yet</p>
                      </div>
                    )}

                    {user && user._id === auction.owner?._id && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                        <p className="text-sm font-bold text-amber-700">You are the owner of this auction</p>
                      </div>
                    )}
                  </div>

                  <div className="glass-card rounded-3xl border border-white/50 p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Auction Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Category</span>
                        <span className="font-bold text-slate-900">{auction.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Starting Price</span>
                        <span className="font-bold text-slate-900">{formatCurrency(auction.startingPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Ends At</span>
                        <span className="font-bold text-slate-900">{formatDate(auction.endsAt)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Total Bids</span>
                        <span className="font-bold text-slate-900">{auction.bids?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Listed On</span>
                        <span className="font-bold text-slate-900">{formatDate(auction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon="search"
              title="Auction not found"
              description="The auction you are looking for does not exist or has been removed."
              actionLabel="Back to Auctions"
              actionHref="/dashboard/auctions"
            />
          )}
        </div>
      </main>
    </div>
  );
}