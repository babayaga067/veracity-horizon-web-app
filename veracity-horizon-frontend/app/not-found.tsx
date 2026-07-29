"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <p className="text-lg text-slate-600 mb-8">Page not found</p>
        <Link
          href="/"
          className="btn-primary px-6 py-3 text-sm font-bold rounded-xl"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}