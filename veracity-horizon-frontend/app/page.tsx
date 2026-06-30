"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { getAuctions, getFeaturedAuctions } from "@/app/lib/api/auctions";
import { formatCurrency } from "@/app/lib/utils/currency";
import { imageUrl } from "@/app/lib/api/config";
import type { Auction } from "@/app/lib/types/auction";

export default function LandingPage() {
  const { user, loading } = useAuthRedirect();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [featured, setFeatured] = useState<Auction | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, featuredRes] = await Promise.all([
          getAuctions(),
          getFeaturedAuctions()
        ]);
        if (allRes.success) {
          const data = allRes.data;
          setAuctions(data);
          setFeatured(featuredRes.success && featuredRes.data.length > 0 ? featuredRes.data[0] : data[0] || null);
        }
      } catch (err) {
        console.error("Failed to load landing data:", err);
      }
    };
    fetchData();
  }, []);

  const activeAuctions = auctions.filter(a => a.status === "active" || a.status === "open").length;
  const totalValue = auctions.reduce((sum, a) => sum + (a.currentBid || a.startingPrice), 0);

  const getDaysLeft = () => {
    if (!featured?.endsAt) return "7";
    const end = typeof featured.endsAt === "string" ? new Date(featured.endsAt) : featured.endsAt;
    const now = new Date();
    const diff = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return diff.toString();
  };
  const daysLeft = getDaysLeft();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <div className="animate-spin h-8 w-8 border-2 border-white/30 border-t-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all">
                V
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-white block">Veracity</span>
                <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-widest">Horizon</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#featured" className="text-sm font-semibold text-blue-100 hover:text-white transition-colors">Featured</Link>
              <Link href="#how-it-works" className="text-sm font-semibold text-blue-100 hover:text-white transition-colors">How It Works</Link>
              <Link href="#stats" className="text-sm font-semibold text-blue-100 hover:text-white transition-colors">Stats</Link>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/dashboard" className="px-4 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-bold text-white hover:text-blue-200 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn-primary px-5 py-2.5 text-sm font-bold rounded-xl">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Auctions Happening Now</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Discover, Bid, and Win{" "}
            <span className="gradient-text">Premium Assets</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join the premier marketplace for high-value assets. Fast, secure, and fully transparent bidding at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/market" : "/register"} className="btn-primary px-8 py-4 text-base font-bold rounded-2xl flex items-center gap-2">
              {user ? "Explore Market" : "Start Bidding Now"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="#featured" className="px-8 py-4 text-base font-bold text-slate-700 bg-white/50 hover:bg-white/70 rounded-2xl transition-all border border-white/50">
              View Featured
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-6">
              <p className="text-3xl font-bold gradient-text">{activeAuctions}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Active Auctions</p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <p className="text-3xl font-bold gradient-text">{auctions.length}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Listings</p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <p className="text-3xl font-bold gradient-text">रु {totalValue > 100000 ? `${(totalValue / 100000).toFixed(1)}L` : totalValue.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auction Section */}
      {featured && (
        <section id="featured" className="relative py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Featured Auction</h2>
              <p className="text-slate-600">Don&apos;t miss out on this exceptional opportunity</p>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-0">
                 <div className="relative h-64 lg:h-auto bg-gradient-to-br from-slate-800 to-slate-900">
                  {imageUrl((featured?.imageUrls as string[] | undefined)?.[0]) ? (
                    <Image src={imageUrl((featured?.imageUrls as string[] | undefined)?.[0])!} alt={featured?.title || "Featured"} fill className="object-cover opacity-90" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-8 lg:p-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-100 mb-4 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Featured Auction
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mb-3">{featured.title}</h3>
                  <p className="text-slate-600 mb-6 line-clamp-2">{featured.description || "Premium auction item"}</p>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Bid</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(featured.currentBid || featured.startingPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Category</p>
                      <p className="text-sm font-bold text-slate-700">{featured.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/auctions/${featured._id}`} className="btn-primary px-6 py-3 text-sm font-bold rounded-xl flex items-center gap-2">
                      Place Bid
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <span className="text-xs text-slate-400">Ends in {daysLeft} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Three simple steps to start winning premium auctions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-3xl p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-14 0h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Create Account</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Register in seconds and get instant access to exclusive auctions worldwide.</p>
            </div>

            <div className="glass-card rounded-3xl p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Browse & Bid</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Explore curated listings across art, collectibles, electronics, and more.</p>
            </div>

            <div className="glass-card rounded-3xl p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Win & Collect</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Secure payment, insured shipping, and authenticated delivery guaranteed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-dark rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12 text-white">Trusted by Thousands</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-4xl font-bold text-blue-400 mb-2">12K+</p>
                  <p className="text-sm text-blue-200 font-medium">Active Bidders</p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-4xl font-bold text-purple-400 mb-2">रु 5Cr+</p>
                  <p className="text-sm text-purple-200 font-medium">Total Sales</p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-4xl font-bold text-emerald-400 mb-2">98%</p>
                  <p className="text-sm text-emerald-200 font-medium">Satisfaction Rate</p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-4xl font-bold text-amber-400 mb-2">24/7</p>
                  <p className="text-sm text-amber-200 font-medium">Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Browse Categories</h2>
            <p className="text-slate-600">Find exactly what you&apos;re looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate"].map((cat, i) => {
              const colors = [
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-pink-500",
                "from-amber-500 to-orange-500",
                "from-emerald-500 to-teal-500",
                "from-rose-500 to-red-500",
                "from-indigo-500 to-blue-500"
              ];
              return (
                <Link key={cat} href="/market" className="group">
                  <div className={`glass-card rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-white/30`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[i]} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-12 0l8 8 8-8" />}
                        {i === 1 && <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />}
                        {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l18 0M3 7l18 0M3 3l18 0M3 17l18 0M3 21l18 0" />}
                        {i === 3 && <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2" />}
                        {i === 4 && <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                        {i === 5 && <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2 4 4 8-8 4 4" />}
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{cat}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to Start Bidding?</h2>
              <p className="text-slate-600 mb-8 max-w-xl mx-auto">Join thousands of bidders and sellers on the most trusted auction platform.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="btn-primary px-8 py-4 text-base font-bold rounded-2xl">
                  Create Free Account
                </Link>
                <Link href="/market" className="px-8 py-4 text-base font-bold text-slate-700 bg-white/50 hover:bg-white/70 rounded-2xl transition-all border border-white/50">
                  Browse Auctions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                V
              </div>
              <span className="font-bold text-lg tracking-tight text-white">Veracity Horizon</span>
            </div>
            <p className="text-sm text-blue-200/80">© {new Date().getFullYear()} Veracity Horizon Auctions. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-blue-200/80 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-sm text-blue-200/80 hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-sm text-blue-200/80 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
