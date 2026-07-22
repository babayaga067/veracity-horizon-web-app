"use client";

import Link from "next/link";
import Image from "next/image";
import type { Auction } from "@/app/lib/types/auction";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";

interface AuctionCardProps {
  auction: Auction;
  showImage?: boolean;
  compact?: boolean;
}

function getStatusColor(status: Auction["status"]) {
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
}

function getTimeLeft(endsAt: Auction["endsAt"]) {
  if (!endsAt) return "No end date";
  const end = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function AuctionCard({ auction, showImage = true, compact = false }: AuctionCardProps) {
  const title = auction.title;
  const status = auction.status;
  const category = auction.category;
  const imgSrc = imageUrl((auction.imageUrls as string[] | undefined)?.[0]);
  const ownerFirstName = auction.owner?.firstName ?? "";
  const ownerLastName = auction.owner?.lastName ?? "";

  if (compact) {
    return (
      <Link
        href={`/dashboard/auctions/${auction._id}`}
        className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
      >
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            {imgSrc ? (
              <Image src={imgSrc} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{title}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
                {(status || "upcoming").toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{category}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold text-slate-900">{formatCurrency(auction.currentBid || auction.startingPrice)}</span>
              <span className="text-xs text-slate-400">{getTimeLeft(auction.endsAt)}</span>
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
      {showImage && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {imgSrc ? (
            <Image src={imgSrc} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{category}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1 truncate group-hover:text-blue-600 transition-colors">{title}</h3>
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
              {ownerFirstName[0]}{ownerLastName[0]}
            </div>
            <span className="text-xs text-slate-500">{ownerFirstName} {ownerLastName}</span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getTimeLeft(auction.endsAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
