"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { getAuctionById } from "@/app/lib/api/auctions";
import type { Auction } from "@/app/lib/api/auctions";
import { handlePlaceBid } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { formatCurrency } from "@/app/lib/utils/currency";

export default function AuctionDetailPage() {
  const { user, loading } = useAuthRedirect();
  const params = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidStatus, setBidStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const fetchAuction = useCallback(async (id: string) => {
    try {
      const response = await getAuctionById(id);
      if (response.success) {
        setAuction(response.data);
        setBidAmount(response.data.currentBid || response.data.startingPrice);
      }
    } catch (error) {
      console.error("Failed to fetch auction:", error);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAuction(params.id as string);
    }
  }, [params.id, fetchAuction]);

  const handlePlaceBidClick = async () => {
    if (!auction || !params.id) return;
    setBidStatus(null);
    setIsPlacingBid(true);
    const result = await handlePlaceBid(auction._id, bidAmount);
    setIsPlacingBid(false);
    if (result.success) {
      setBidStatus({ message: "Bid placed successfully!", type: "success" });
      setAuction({ ...auction, currentBid: bidAmount });
    } else {
      setBidStatus({ message: result.message || "Failed to place bid", type: "error" });
    }
  };

  const getMinBid = () => {
    if (!auction) return 0;
    return (auction.currentBid || auction.startingPrice) + 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{!user ? "Please log in to view auctions." : "Auction not found."}</p>
          {!user && <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go to Login</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-4xl w-full mx-auto px-8 py-8 space-y-6">
          <Link href="/dashboard/auctions" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Auctions
          </Link>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{auction.category}</span>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">{auction.title}</h1>
              <p className="text-sm text-slate-600 mt-3 max-w-md">{auction.description}</p>
            </div>
            <span className="text-3xl font-bold text-slate-900">{formatCurrency(auction.currentBid || auction.startingPrice)}</span>
          </div>

          <div className="mt-6">
            <span className="text-xs text-slate-500">Owner: {auction.owner.firstName} {auction.owner.lastName}</span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-xs text-slate-500">Status: {auction.status.toUpperCase()}</span>
          </div>

          {auction.imageUrls && auction.imageUrls.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {auction.imageUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`Auction image ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
          )}

          <div className="mt-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Place Bid (min: {formatCurrency(getMinBid())})
            </label>
            {bidStatus && (
              <div className={`p-3 rounded-xl mb-3 ${bidStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                <p className="text-sm font-medium">{bidStatus.message}</p>
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={getMinBid()}
                step="1"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={handlePlaceBidClick}
                disabled={isPlacingBid}
                className="btn-primary px-6 py-3 text-xs tracking-wider uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingBid ? "Placing..." : "Place Bid"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}