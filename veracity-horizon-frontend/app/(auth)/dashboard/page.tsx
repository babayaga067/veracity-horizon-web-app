"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AuctionItem {
  id: string;
  lot: string;
  category: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  status: "LIVE" | "ENDING SOON";
  imageText: string;
}

export default function DashboardPage() {
  const [vaultBalance, setVaultBalance] = useState<number>(1248390);
  const [featuredBid, setFeaturedBid] = useState<number>(482000);
  const [auctions, setAuctions] = useState<AuctionItem[]>([
    {
      id: "1",
      lot: "LOT 0423",
      category: "FINE ART",
      title: "Ethereal Geometry No. 12",
      currentBid: 824000,
      timeLeft: "02h 14m 10s",
      status: "LIVE",
      imageText: "🖼️ Spatial Canvas Geometry Abstract",
    },
    {
      id: "2",
      lot: "LOT 0424",
      category: "TIMEPIECES",
      title: "Vintage Chronograph 1964",
      currentBid: 210000,
      timeLeft: "00h 12m 45s",
      status: "ENDING SOON",
      imageText: "⌚ Luxury Horology Mechanical Dial",
    },
    {
      id: "3",
      lot: "LOT 0425",
      category: "SPIRITS",
      title: "Grand Cru Reserved 1948",
      currentBid: 18500,
      timeLeft: "18h 45m 02s",
      status: "LIVE",
      imageText: "🍾 Premium Decanter Crystal Reserve",
    },
    {
      id: "4",
      lot: "LOT 0426",
      category: "AUTOMOTIVE",
      title: "Pioneer GTR Heritage",
      currentBid: 1450000,
      timeLeft: "2d 04h 11m",
      status: "LIVE",
      imageText: "🏎️ Classic Collector Sports Chassis",
    },
  ]);

  const handlePlaceFeaturedBid = () => {
    setFeaturedBid((prev) => prev + 5000);
    setVaultBalance((prev) => Math.max(0, prev - 5000));
  };

  const handleQuickBid = (id: string) => {
    setAuctions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const increment = item.category === "AUTOMOTIVE" ? 25000 : 2500;
          return { ...item, currentBid: item.currentBid + increment };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col justify-between font-sans antialiased">
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">Veracity Horizon</div>
          <nav className="hidden md:flex space-x-8 text-xs uppercase tracking-wider font-bold text-gray-400">
            <Link href="/dashboard" className="text-gray-900 border-b-2 border-gray-900 pb-1">
              Home
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Market
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Auctions
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Portfolio
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <span className="text-lg cursor-pointer">🔔</span>
            <Link
              href="/login"
              className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs"
              title="Sign Out"
            >
              U
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative h-80 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-8 flex flex-col justify-between overflow-hidden shadow-sm">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
            <div>
              <span className="text-[10px] bg-white/10 text-blue-300 font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                PREMIER LOT 0422
              </span>
              <h1 className="text-3xl font-semibold tracking-tight mt-3 max-w-md">
                The Perpetual Calendar Horizon
              </h1>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                A masterwork of horological engineering, featuring a unique silver-blue oscillating weight and provenance auditing records.
              </p>
            </div>
            <div className="flex items-end justify-between z-10">
              <div className="flex space-x-8">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Current Bid</span>
                  <span className="text-xl font-bold">${featuredBid.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Time Left</span>
                  <span className="text-xl font-mono text-amber-400 font-semibold">04h 22m 18s</span>
                </div>
              </div>
              <button
                onClick={handlePlaceFeaturedBid}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded shadow-sm transition-transform active:scale-95"
              >
                Place Bid
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Vault Balance</span>
                <span className="text-sm">💳</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
                ${vaultBalance.toLocaleString()}
              </h2>
              <span className="text-[11px] text-green-600 font-semibold mt-1 inline-block">
                ↗ +$45,200 (MoM Portfolio Yield)
              </span>
            </div>
            <div className="border-t border-gray-50 pt-4 mt-4">
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Bid Velocity</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">42</span>
                <span className="text-xs text-gray-400">bids per hour across ecosystem</span>
              </div>
            </div>
            <button
              onClick={() => setVaultBalance((prev) => prev + 100000)}
              className="w-full bg-[#111827] hover:bg-slate-800 text-white font-medium text-xs tracking-wider uppercase py-3 rounded-lg text-center mt-4 transition-colors"
            >
              Deposit Liquidity Funds
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-gray-900">Active High-Value Auctions</h3>
              <p className="text-xs text-gray-400 mt-0.5">Curated institutional-grade assets available for immediate bidding.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
              View All Marketplace →
            </span>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {auctions.map((item) => (
              <div key={item.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{item.category}</span>
                    <h4 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">{item.imageText}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-400">{item.lot}</p>
                    <span className="mt-2 block text-2xl font-bold text-slate-900">${item.currentBid.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-wider text-slate-600">
                    {item.status}
                  </span>
                  <span className="text-xs text-slate-500">{item.timeLeft}</span>
                  <button
                    onClick={() => handleQuickBid(item.id)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-slate-800"
                  >
                    Quick Bid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
