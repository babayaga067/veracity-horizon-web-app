"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Auction, PaginationMeta } from "@/app/lib/actions/auction-action";

interface AuctionTableProps {
  auctions: Auction[];
  pagination: PaginationMeta;
  search?: string;
}

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

export default function AuctionTable({ auctions, pagination, search }: AuctionTableProps) {
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const pathname = usePathname();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("size", String(pagination.size));
    if (value) {
      params.set("search", value);
    }
    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    window.dispatchEvent(new Event("popstate"));
  };

  const filteredAuctions = auctions.filter((a) => {
    const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const makePaginationLink = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(pagination.size));
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    return `/admin/auctions?${params.toString()}`;
  };

  const isPrevDisabled = pagination.page <= 1;
  const isNextDisabled = pagination.page >= pagination.totalPages;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Auctions</h2>
          <p className="text-sm text-gray-500">Manage auctions, bids, and sellers</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
                    {auction.imageUrls?.[0] && (
                      <img src={auction.imageUrls[0]} alt={auction.title} className="w-12 h-12 rounded-md object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{auction.title}</p>
                      <p className="text-sm text-gray-500">रु {auction.startingPrice}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {auction.owner.firstName} {auction.owner.lastName}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(auction.status)}`}>
                    {auction.status.toUpperCase()}
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
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this auction?")) {
                          fetch(`/api/v1/auctions/${auction._id}`, { method: "DELETE" });
                        }
                      }}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAuctions.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-gray-500 font-medium">No auctions found</p>
          <p className="text-gray-400 text-sm mt-1">No auctions match your current search or filters</p>
        </div>
      )}

      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-500">
          {filteredAuctions.length > 0 && (
            <>Showing {filteredAuctions.length} of {auctions.length} auctions</>
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
  );
}