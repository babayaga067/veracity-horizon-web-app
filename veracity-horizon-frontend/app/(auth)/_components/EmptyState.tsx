"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl mb-4 border border-slate-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-md mb-6 font-medium">{description}</p>
      {actionLabel && (actionHref ? (
        <Link
          href={actionHref}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
        >
          {actionLabel}
        </button>
      ))}
    </div>
  );
}
