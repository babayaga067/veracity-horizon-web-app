"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { deleteAuctionAction } from "@/app/lib/actions/auction-action";
import type { Auction } from "@/app/lib/types/auction";
import type { PaginationMeta } from "@/app/lib/types/pagination";
import { imageUrl } from "@/app/lib/api/config";

interface AuctionTableProps {
  auctions: Auction[];
  pagination: PaginationMeta;
  search?: string;
  status?: string;
}

const ALL_CATEGORIES = [
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

function formatDate(date: Date | string | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "open":
      return "bg-indigo-100 text-indigo-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AuctionTable({ auctions, pagination, search, status }: AuctionTableProps) {
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedStatus, setSelectedStatus] = useState(status || "all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startAction] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const matchesSearch = !searchTerm ||
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (auction.owner?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (auction.owner?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === "all" || auction.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || auction.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [auctions, searchTerm, selectedStatus, selectedCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(pagination.limit));
    if (value) params.set("search", value);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(pagination.limit));
    if (searchTerm) params.set("search", searchTerm);
    if (value !== "all") params.set("status", value);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(pagination.limit));
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (value !== "all") params.set("category", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const makePaginationLink = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pagination.limit));
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    return `/admin/auctions?${params.toString()}`;
  };

  const isPrevDisabled = pagination.page <= 1;
  const isNextDisabled = pagination.page >= pagination.totalPages;

  const confirmDelete = (id: string) => {
    startAction(async () => {
      const result = await deleteAuctionAction(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message || "Failed to delete auction");
      }
    });
    setShowDeleteModal(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Auctions</h2>
            <p className="text-sm text-gray-500">Manage auctions, bids, and sellers</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search auctions..."
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 w-64"
            />
            <Link href="/admin/auctions/create">
              <button className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Auction
              </button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Auction</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAuctions.map((auction) => (
                <tr key={auction._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       {imageUrl((auction.imageUrls as string[] | undefined)?.[0]) ? (
                         <Image src={imageUrl((auction.imageUrls as string[] | undefined)?.[0])!} alt={auction.title} width={48} height={48} className="rounded-md object-cover" />
                       ) : (
                         <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                           <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                           </svg>
                         </div>
                       )}
                      <div>
                        <p className="font-medium text-gray-900">{auction.title}</p>
                        <p className="text-sm text-gray-500">रु {auction.startingPrice}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {auction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {auction.owner?.firstName} {auction.owner?.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(auction.status)}`}>
                      {(auction.status || "upcoming").toUpperCase()}
                    </span>
                    {auction.isFeatured && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(auction.endsAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/auctions/${auction._id}`}>
                        <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-xs font-medium transition-colors">
                          View
                        </button>
                      </Link>
                      <Link href={`/admin/auctions/${auction._id}/edit`}>
                        <button className="px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 text-xs font-medium transition-colors">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(auction._id)}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAuctions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <p className="text-gray-500 font-medium">No auctions found</p>
                    <p className="text-gray-400 text-sm mt-1">No auctions match your current search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {filteredAuctions.length > 0 && (
              <>Showing {filteredAuctions.length} of {pagination.total} auctions</>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Link
              href={makePaginationLink(pagination.page - 1)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                isPrevDisabled ? "pointer-events-none text-gray-300" : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm text-gray-600 px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Link
              href={makePaginationLink(pagination.page + 1)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                isNextDisabled ? "pointer-events-none text-gray-300" : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Auction?</h3>
            <p className="text-slate-600 mb-4">This action cannot be undone. The auction will be permanently removed.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteModal)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}