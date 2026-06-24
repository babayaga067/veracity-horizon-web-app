"use client";

import React, { useState, useEffect } from "react";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { getAuctions } from "@/app/lib/api/auctions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { AuctionCard } from "@/app/(auth)/_components/AuctionCard";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { SkeletonCard } from "@/app/(auth)/_components/SkeletonCard";

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

const categories = ["All", "Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate"];

export default function AuctionsPage() {
  const { loading } = useAuthRedirect();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAuctions();
        if (response.success) {
          setAuctions(response.data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load auctions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter((a) => {
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">All Auctions</h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">Browse and manage all auction listings</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4 text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-gray-50 text-slate-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAuctions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredAuctions.map((item) => (
                <AuctionCard key={item._id} auction={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📭"
              title="No auctions found"
              description="No auctions match your current filters. Try adjusting your search criteria."
              actionLabel="Clear Filters"
              onAction={() => { setSelectedCategory("All"); setSearchQuery(""); }}
            />
          )}

          {!isLoading && !error && (
            <div className="text-center text-sm text-slate-400 pb-8">
              Showing {filteredAuctions.length} of {auctions.length} auctions
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
