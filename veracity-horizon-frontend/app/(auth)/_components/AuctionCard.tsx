"use client";

import React from "react";
import Link from "next/link";
import { Auction } from "@/app/lib/api/auctions";
import { formatCurrency } from "@/app/lib/utils/currency";

interface AuctionCardProps {
  auction: Auction;
  showImage?: boolean;
  compact?: boolean;
}

export function AuctionCard({ auction, showImage = true, compact = false }: AuctionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "closed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getTimeLeft = () => {
    if (!auction.endsAt) return "No end date";
    const end = typeof auction.endsAt === "string" ? new Date(auction.endsAt) : auction.endsAt;
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (compact) {
    return (
      <Link
        href={`/dashboard/auctions/${auction._id}`}
        className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
      >
        <div className="flex gap-4">
          {showImage && auction.imageUrls?.[0] && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={auction.imageUrls[0]} alt={auction.title} className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{auction.title}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(auction.status)}`}>
                {auction.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{auction.category}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold text-slate-900">{formatCurrency(auction.currentBid || auction.startingPrice)}</span>
              <span className="text-xs text-slate-400">{getTimeLeft()}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/auctions/${auction._id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 group"
    >
      {showImage && auction.imageUrls?.[0] && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={auction.imageUrls[0]}
            alt={auction.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(auction.status)}`}>
              {auction.status.toUpperCase()}
            </span>
          </div>
          {auction.isFeatured && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                FEATURED
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{auction.category}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1 truncate group-hover:text-blue-600 transition-colors">{auction.title}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-400">Current</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{auction.description || "No description available"}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {auction.owner?.firstName?.[0]}{auction.owner?.lastName?.[0]}
            </div>
            <span className="text-xs text-slate-500">{auction.owner?.firstName} {auction.owner?.lastName}</span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getTimeLeft()}
          </span>
        </div>
      </div>
    </Link>
  );
}
