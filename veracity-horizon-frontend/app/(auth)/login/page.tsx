"use client";

import React from "react";
import Link from "next/link";
import LoginForm from "@/app/(auth)/_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex font-sans antialiased animated-gradient">
      {/* LEFT PANEL: Brand */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 glass-dark z-0"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-400 blur-3xl opacity-20 z-0 float"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-500 blur-3xl opacity-20 z-0 float-delayed"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">Veracity Horizon</span>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold tracking-wider uppercase mb-6 border border-white/20">
            Live Auction Platform
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
            Discover, bid, and win with confidence.
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Join the premier marketplace for high-value assets. Fast, secure, and fully transparent bidding at your fingertips.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-indigo-200/80">
          © {new Date().getFullYear()} Veracity Horizon Auctions.
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="w-full lg:w-7/12 flex flex-col p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">Veracity Horizon</span>
          </div>

          <div className="glass-card rounded-3xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-base">Sign in to your account to place bids and track your auctions.</p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
