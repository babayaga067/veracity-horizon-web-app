"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { handleVerifyEmail, handleSendVerificationEmail } from "@/app/lib/actions/auth-actions";
import { useToast } from "@/app/(auth)/_components/Toast";

export default function EmailVerificationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<"enter" | "success" | "error">("enter");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      setStep("enter");
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await handleVerifyEmail(token);
      if (result.success) {
        setStep("success");
        addToast("Email verified successfully!", "success");
      } else {
        setStep("error");
        setError(result.message || "Verification failed. Please try again.");
      }
    } catch {
      setStep("error");
      setError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await handleSendVerificationEmail("user@example.com");
      if (result.success) {
        addToast("Verification email resent!", "success");
        setCountdown(60);
      } else {
        setError(result.message || "Failed to resend. Please try again.");
      }
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verify Your Email</h1>
          <p className="text-slate-500 mt-2 text-sm">
            We sent a verification link to your email. Enter the token below to verify your account.
          </p>
        </div>

        {step === "enter" && (
          <form onSubmit={handleVerify} className="glass-card rounded-3xl p-8 space-y-5">
            <div>
              <label htmlFor="token" className="block text-sm font-semibold text-slate-700 mb-2">
                Verification Token
              </label>
              <input
                id="token"
                type="text"
                value={token || ""}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter verification token"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="btn-primary w-full py-3 text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-500 text-sm">Your email has been successfully verified.</p>
            <Link href="/dashboard" className="btn-primary inline-block mt-6 px-6 py-3 text-sm font-bold rounded-xl">
              Go to Dashboard
            </Link>
          </div>
        )}

        {step === "error" && (
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-500 text-sm mb-4">{error || "Invalid or expired token."}</p>
            <button
              onClick={() => { setStep("enter"); setToken(""); setError(null); }}
              className="btn-outline inline-block px-6 py-3 text-sm font-bold rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={handleResend}
              disabled={isSubmitting || countdown > 0}
              className="font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
            </button>
          </p>
          <p className="text-sm text-slate-400 mt-3">
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
