"use client";

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: { value: number; label: string };
  color: "blue" | "indigo" | "emerald" | "amber" | "rose";
}

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
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shadow-sm ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
