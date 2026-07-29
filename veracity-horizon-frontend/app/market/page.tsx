"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { useRouter } from "next/navigation";
import { fetchAuctionsAction } from "@/app/lib/actions/auction-action";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import { AuctionCard } from "@/app/(auth)/_components/AuctionCard";
import { EmptyState } from "@/app/(auth)/_components/EmptyState";
import { SkeletonCard } from "@/app/(auth)/_components/SkeletonCard";
import CreateAuctionForm from "@/app/(auth)/_components/CreateAuctionForm";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import AISearchBar from "@/app/(auth)/_components/AISearchBar";
import type { Auction } from "@/app/lib/types/auction";
import type { PaginationMeta } from "@/app/lib/types/pagination";

const ALL_CATEGORIES = [
  "All",
  "Art",
  "Electronics",
  "Vehicles",
  "Collectibles",
  "Fashion",
  "Real Estate",
  "Textiles",
  "Jewelry",
  "Antiques",
  "Food & Spices",
  "Handicrafts",
  "Musical Instruments",
  "Books & Manuscripts",
  "Furniture",
  "Sports & Gear",
  "Home & Living",
  "Industrial Equipment",
  "Luxury Goods",
  "Agriculture & Livestock",
  "Tools & Hardware",
  "Ceramics & Pottery",
  "Carpets & Rugs",
  "Coins & Currency",
  "Watches & Timepieces",
  "Photography",
  "Sculptures",
  "Paintings",
  "Textbooks & Academic",
  "Outdoor & Adventure",
  "Health & Wellness",
  "Office Supplies",
  "Children & Toys",
  "Cultural Heritage",
  "Religious Items",
  "Digital Assets",
];

export default function MarketPage() {
  const { loading } = useAuthRedirect();
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search") || "";
    }
    return "";
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef(searchQuery);

  const syncSearchUrl = useCallback((query: string) => {
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    const qs = params.toString();
    router.replace(qs ? `/market?${qs}` : "/market");
  }, [router]);

  useEffect(() => {
    const syncFromUrl = () => {
      const current = new URLSearchParams(window.location.search).get("search") || "";
      if (current !== searchRef.current) {
        searchRef.current = current;
        setSearchQuery(current);
      }
    };
    syncFromUrl();
    const onPopState = () => syncFromUrl();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = new URLSearchParams(window.location.search).get("search") || "";
      if (current !== searchRef.current) {
        searchRef.current = current;
        setSearchQuery(current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuctions = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const status = selectedCategory === "All" ? "" : selectedCategory;
      const response = await fetchAuctionsAction(page, 12, searchQuery, status);
      if (response.success && response.data) {
        setAuctions(response.data.data);
        setPagination(response.data.meta);
      } else {
        setAuctions([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load market");
      setAuctions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAuctions(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchAuctions]);

  const handlePageChange = (page: number) => {
    fetchAuctions(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Marketplace</h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">Browse active auctions and place bids</p>
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

          <div className="glass-card rounded-3xl border border-white/50 p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white/50 text-slate-600 hover:bg-white border border-white/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative min-w-[200px]">
              <AISearchBar
                onSearch={(query) => { setSearchQuery(query); syncSearchUrl(query); }}
                placeholder="Search with AI..."
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)
            ) : auctions.length > 0 ? (
              auctions.map((item) => <AuctionCard key={item._id} auction={item} />)
            ) : (
              <EmptyState
                icon="search"
                title="No auctions found"
                description="Try adjusting your search or filter to find what you are looking for."
                actionLabel="Clear Filters"
                  onAction={() => { setSelectedCategory("All"); setSearchQuery(""); syncSearchUrl(""); }}
              />
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-slate-500 font-medium">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} auctions
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full my-8 border border-white/50">
            <CreateAuctionForm
              onSuccess={() => {
                setShowCreateModal(false);
                fetchAuctions(1);
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}