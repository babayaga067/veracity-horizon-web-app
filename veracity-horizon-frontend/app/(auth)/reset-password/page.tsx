"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PasswordResetForm from "@/app/(auth)/_components/PasswordResetForm";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Link</h2>
            <p className="text-slate-500 text-sm mb-4">Missing or invalid reset token.</p>
            <Link href="/forgot-password" className="text-indigo-600 font-bold hover:underline">Request a new reset link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-sans antialiased animated-gradient">
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 glass-dark z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-400 blur-3xl opacity-20 z-0 float" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-500 blur-3xl opacity-20 z-0 float-delayed" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">Veracity Horizon</span>
        </div>
        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold tracking-wider uppercase mb-6 border border-white/20">Reset Password</span>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-6">Set a new password.</h1>
          <p className="text-indigo-100 text-lg leading-relaxed">Choose a strong password to secure your account.</p>
        </div>
        <div className="relative z-10 text-sm font-medium text-indigo-200/80">© {new Date().getFullYear()} Veracity Horizon Auctions.</div>
      </div>
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Reset Password</h2>
              <p className="text-slate-500 text-base">Enter your new password below.</p>
            </div>
            <PasswordResetForm token={token} />
          </div>
          <div className="mt-8 text-center text-slate-600">
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
