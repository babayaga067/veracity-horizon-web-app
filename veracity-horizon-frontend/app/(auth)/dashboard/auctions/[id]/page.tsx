"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Image from "next/image";
import { imageUrl } from "@/app/lib/api/config";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { getAuctionById, getAuctions } from "@/app/lib/api/auctions";
import type { Auction } from "@/app/lib/types/auction";
import { handlePlaceBid } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { formatCurrency } from "@/app/lib/utils/currency";
import BackArrow from "@/app/(components)/BackArrow";

export default function AuctionDetailPage() {
  const { user, loading } = useAuthRedirect();
  const params = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [relatedAuctions, setRelatedAuctions] = useState<Auction[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidStatus, setBidStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchAuction = useCallback(async (id: string) => {
    try {
      const response = await getAuctionById(id);
      if (response.success) {
        setAuction(response.data);
        setBidAmount(response.data.currentBid || response.data.startingPrice);
        const firstImage = (response.data.imageUrls as string[] | undefined)?.[0] || null;
        setSelectedImage(firstImage);
      }
    } catch (error) {
      console.error("Failed to fetch auction:", error);
    }
  }, []);

  const fetchRelatedAuctions = useCallback(async (category: string, currentId: string) => {
    try {
      const response = await getAuctions();
      if (response.success && response.data) {
        setRelatedAuctions(response.data.filter((a) => a.category === category && a._id !== currentId).slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to fetch related auctions:", error);
    }
  }, []);

  useEffect(() => {
    if (params.id && typeof params.id === "string" && params.id.length > 0) {
      fetchAuction(params.id);
    }
  }, [params.id, fetchAuction]);

  useEffect(() => {
    if (auction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRelatedAuctions(auction.category, auction._id);
    }
  }, [auction, fetchRelatedAuctions]);

  const handlePlaceBidClick = async () => {
    if (!auction || !params.id) return;
    setBidStatus(null);

    const freshAuction = await getAuctionById(params.id as string);
    if (!freshAuction.success || !freshAuction.data) {
      setBidStatus({ message: "Failed to load latest auction data. Please try again.", type: "error" });
      return;
    }

    setAuction(freshAuction.data);
    const minBid = (freshAuction.data.currentBid || freshAuction.data.startingPrice) + 1;
    if (bidAmount < minBid) {
      setBidAmount(minBid);
    }

    setIsPlacingBid(true);
    const result = await handlePlaceBid(freshAuction.data._id, bidAmount);
    setIsPlacingBid(false);
    if (result.success) {
      setBidStatus({ message: "Bid placed successfully!", type: "success" });
      setAuction({ ...freshAuction.data, currentBid: bidAmount });
    } else {
      setBidStatus({ message: result.message || "Failed to place bid", type: "error" });
    }
  };

  const getMinBid = () => {
    if (!auction) return 0;
    return (auction.currentBid || auction.startingPrice) + 1;
  };

  const getTimeLeft = () => {
    if (!auction?.endsAt) return "No end date";
    const end = typeof auction.endsAt === "string" ? new Date(auction.endsAt) : auction.endsAt;
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-10 w-10 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{!user ? "Please log in to view auctions." : "Auction not found."}</p>
          {!user && (
            <Link href="/login" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Go to Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <BackArrow href="/dashboard/auctions" />
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(auction.status)}`}>
                {(auction.status || "upcoming").toUpperCase()}
              </span>
              {auction.isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Image Gallery */}
            <div className="lg:col-span-2 space-y-4">
              {selectedImage ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-gray-200">
                  <Image src={imageUrl(selectedImage)!} alt={auction.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 flex items-center justify-center">
                  <svg className="w-20 h-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              
               {auction &&Array.isArray(auction.imageUrls) && auction.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {auction.imageUrls.map((url: string, idx: number) => (
                       <button
                       key={idx}
                        onClick={() => setSelectedImage(url)}
                       className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                         selectedImage === url ? "border-blue-500" : "border-transparent"
                       }`}
                     >
                       <Image src={imageUrl(url)!} alt={`Thumbnail ${idx + 1}`} fill className="object-cover hover:opacity-80 transition-opacity" />
                     </button>
                    ))}
                  </div>
                )}

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 leading-relaxed">{auction.description || "No description available."}</p>
              </div>

              {/* Bid History */}
              {auction.bids && auction.bids.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Bid History ({auction.bids.length})</h2>
                    <Link href="#bidders" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      View all bidders
                    </Link>
                  </div>
<div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {auction.bids
                      .slice()
                      .sort((a: { amount: number }, b: { amount: number }) => b.amount - a.amount)
.map((bid, sortedIdx: number) => {
                        const bidderName = typeof bid.user === "object" 
                          ? `${(bid.user as { firstName?: string; lastName?: string }).firstName || ""} ${(bid.user as { firstName?: string; lastName?: string }).lastName || ""}`.trim()
                          : bid.user;
                        const isHighestBid = sortedIdx === 0;
                        return (
                          <div key={`${bid.user}-${bid.amount}-${bid.timestamp}`} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isHighestBid ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50"
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isHighestBid ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              #{sortedIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{bidderName}</p>
                              <p className="text-xs text-slate-500">{bid.timestamp ? new Date(bid.timestamp).toLocaleString() : "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${isHighestBid ? "text-blue-700" : "text-slate-900"}`}>
                                {formatCurrency(bid.amount)}
                              </p>
                              {isHighestBid && (
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Leading</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Auction Details & Bidding */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Bid</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting Price</p>
                    <p className="text-sm text-slate-900 mt-1">{formatCurrency(auction.startingPrice)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Remaining</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{getTimeLeft()}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</p>
                    <p className="text-sm text-slate-900 mt-1">{auction.category}</p>
                  </div>

                   <div>
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seller</p>
                     <p className="text-sm text-slate-900 mt-1">{auction.owner?.firstName ?? "Unknown"} {auction.owner?.lastName ?? ""}</p>
                     <p className="text-xs text-slate-500">@{auction.owner?.username ?? "unknown"}</p>
                   </div>
                </div>

                {auction.status === "active" || auction.status === "open" ? (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2 1.343-2 3-2M12 14c1.657 0 3-.895 3-2s-1.343-2-3-2-3 .895-3 2 1.343 2 3 2" />
                      </svg>
                      <label className="text-sm font-bold text-slate-700">Place Your Bid</label>
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-3">Minimum bid: {formatCurrency(getMinBid())}</p>
                    
                    {bidStatus && (
                      <div className={`p-3 rounded-xl mb-3 ${bidStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                        <p className="text-sm font-medium">{bidStatus.message}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBidAmount(getMinBid())}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          Min Bid
                        </button>
<button
                           type="button"
                           onClick={() => setBidAmount(Math.round((getMinBid() + 100) / 100) * 100)}
                           className="flex-1 px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                         >
                           +रु 100
                         </button>
                         <button
                           type="button"
                           onClick={() => setBidAmount(Math.round((getMinBid() + 500) / 500) * 500)}
                           className="flex-1 px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                         >
                           +रु 500
                         </button>
<button
                           type="button"
                           onClick={() => setBidAmount(Math.round((getMinBid() + 1000) / 1000) * 1000)}
                           className="flex-1 px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                         >
                           +रु 1000
                         </button>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => setBidAmount(Math.max(getMinBid(), bidAmount - 100))}
                          disabled={bidAmount <= getMinBid()}
                          className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          min={getMinBid()}
                          step="1"
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-center text-lg font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        
                        <button
                          type="button"
                          onClick={() => setBidAmount(bidAmount + 100)}
                          className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={handlePlaceBidClick}
                        disabled={isPlacingBid || bidAmount < getMinBid()}
                        className="w-full py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isPlacingBid ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            Placing Bid...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2 1.343-2 3-2" />
                            </svg>
                            Place Bid Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      disabled
                      className="w-full py-3.5 px-4 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 0A9 9 0 015.636 19.636M18.364 5.636a9 9 0 00-12.728 0M21 12a9 9 0 01-9 9c-1.657 0-3-.895-3-2s1.343-2 3-2a9 9 0 019-9" />
                      </svg>
                      Bidding Closed
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V8" />
                    </svg>
                    Download PDF
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.346A9.8 9.8 0 0112 15c3.31 0 6.31-1.555 8.312-4.002a10.025 10.025 0 01-2.135.27 9.866 9.866 0 01-2.135-.27 10.025 10.025 0 01-2.885-.61A10.025 10.025 0 018.684 9.5c-.31-.655-.468-1.38-.468-2.135 0-.755.158-1.48.468-2.135A10.008 10.008 0 0112 3c2.29 0 4.38.87 5.96 2.33.55.39.87.96 1.02 1.52.15-.56.47-1.13 1.02-1.52A10.008 10.008 0 0124 3c2.29 0 4.38.87 5.96 2.33.55.39.87.96 1.02 1.52.15-.56.47-1.13 1.02-1.52A10.008 10.008 0 0124 3" />
                    </svg>
                    Share Auction
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-5.414-9.586a2 2 0 012.828 0L15 11m-2-2l6 6m-6-6l-6 6" />
                    </svg>
                    Report Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Auctions */}
          {relatedAuctions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Related Auctions</h3>
                <Link href="/market" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedAuctions.map((related) => (
                  <Link key={related._id} href={`/dashboard/auctions/${related._id}`} className="group">
                    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                        <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden mb-3 relative">
                            {imageUrl((related.imageUrls as string[] | undefined)?.[0]) ? (
                              <Image src={imageUrl((related.imageUrls as string[] | undefined)?.[0])!} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                </svg>
                              </div>
                            )}
                          </div>
                      <p className="font-semibold text-slate-900 text-sm line-clamp-1">{related.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatCurrency(related.currentBid || related.startingPrice)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}