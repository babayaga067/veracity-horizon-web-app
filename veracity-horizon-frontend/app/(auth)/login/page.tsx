"use client";

import React from "react";
import Link from "next/link";
import LoginForm from "@/app/(auth)/_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex font-sans antialiased bg-white text-slate-900">
      
      {/* LEFT PANEL: Vibrant Brand & Auction Context */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden flex-col justify-between p-12">
        {/* Colorful Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-900 to-purple-900 opacity-90 z-0"></div>
        
        {/* Decorative Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 blur-3xl opacity-30 z-0"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 blur-3xl opacity-30 z-0"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Veracity Horizon
          </span>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold tracking-wider uppercase mb-6 border border-blue-400/30">
            Live Auction Platform
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
            Discover, bid, and win with confidence.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Join the premier marketplace for high-value assets. Fast, secure, and fully transparent bidding at your fingertips.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-blue-200/80">
          © {new Date().getFullYear()} Veracity Horizon Auctions.
        </div>
      </div>

      {/* RIGHT PANEL: Clear & Easy Authentication */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 md:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto">
          
          {/* Mobile-only Header */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">
              Veracity Horizon
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-base">
              Sign in to your account to place bids and track your auctions.
            </p>
          </div>

          {/* Form Component */}
          <LoginForm />

          {/* Easy Registration Link */}
          <div className="mt-8 text-center text-slate-600">
            Donot have an account yet?{" "}
            <Link 
              href="/register" 
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all"
            >
              Register to bid
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}