"use client";

import React, { useState, useEffect } from "react";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { handleGetMyAuctions } from "@/app/lib/actions/auth-actions";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { AuctionCard } from "@/app/(auth)/_components/AuctionCard";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { SkeletonCard } from "@/app/(auth)/_components/SkeletonCard";
import type { Auction } from "@/app/lib/types/auction";

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
        const result = await handleGetMyAuctions();
        if (result.success) {
          setAuctions(result.data || []);
        } else {
          setError(result.message || "Failed to load auctions");
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
    if (!a.title) return false;
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = a.title.toLowerCase().includes(q) ||
      (a.description ? a.description.toLowerCase().includes(q) : false);
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
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your auction listings</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="pl-10 pr-4 py-2 w-64 rounded-md border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)
            ) : filteredAuctions.length > 0 ? (
              filteredAuctions.map((item) => <AuctionCard key={item._id} auction={item} />)
            ) : (
              <EmptyState
                icon="search"
                title="No auctions found"
                description="You haven't created any auctions yet or no auctions match your filters."
                actionLabel="Clear Filters"
                onAction={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              />
            )}
          </div>

          {!isLoading && !error && (
            <div className="text-center text-sm text-gray-500 pt-4">
              Showing {filteredAuctions.length} of {auctions.length} auctions
            </div>
          )}
        </div>
      </main>
    </div>
  );
}