"use client";

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: "package" | "zap" | "dollar" | "user";
  trend?: { value: number; label: string };
  color: "blue" | "indigo" | "emerald" | "amber" | "rose";
}

const icons = {
  package: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
    </svg>
  ),
  zap: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  dollar: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2 1.343-2 3-2M12 14c1.657 0 3-.895 3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2 1.343 2 3 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2" />
    </svg>
  ),
  user: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

export function StatsCard({ title, value, subtitle, icon, trend, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                trend.value >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}>
                {trend.value >= 0 ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-slate-400 font-medium">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-sm ${colorClasses[color]}`}>
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}