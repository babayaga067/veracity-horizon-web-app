"use client";

import React from "react";

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl border border-white/50 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-slate-100 rounded w-16" />
          <div className="h-5 bg-slate-100 rounded w-16" />
        </div>
        <div className="h-5 bg-slate-100 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
          <div className="h-3 bg-slate-100 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardCompact() {
  return (
    <div className="glass-card rounded-2xl border border-white/50 p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
          <div className="flex items-center justify-between">
            <div className="h-5 bg-slate-100 rounded w-20" />
            <div className="h-3 bg-slate-100 rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
