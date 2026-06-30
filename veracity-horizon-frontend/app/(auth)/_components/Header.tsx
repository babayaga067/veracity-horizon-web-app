"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/lib/context/AuthContext";
import { imageUrl } from "@/app/lib/api/config";

interface HeaderProps {
  activePage?: "home" | "market" | "auctions" | "portfolio" | "profile";
}

export function Header({ activePage = "home" }: HeaderProps) {
  const { user } = useAuth();

  const navLinks = [
    { href: "/dashboard", label: "Home", key: "home" },
    { href: "/market", label: "Market", key: "market" },
    { href: "/dashboard/auctions", label: "Auctions", key: "auctions" },
    { href: "/portfolio", label: "Portfolio", key: "portfolio" },
  ];

  return (
<header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
       <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
         <Link href="/dashboard" className="flex items-center gap-2.5">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
             V
           </div>
           <span className="font-bold text-lg tracking-tight text-slate-900">Veracity<span className="text-blue-600">Horizon</span></span>
         </Link>
<nav className="hidden md:flex items-center gap-1">
           {navLinks.map((link) => (
             <Link
               key={link.key}
               href={link.href}
               className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                 activePage === link.key
                   ? "bg-blue-50 text-blue-700"
                   : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
               }`}
             >
               {link.label}
             </Link>
           ))}
           <Link
             href="/dashboard/profile"
             className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
               activePage === "profile"
                 ? "bg-blue-50 text-blue-700"
                 : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
             }`}
           >
             Profile
           </Link>
         </nav>
<div className="flex items-center gap-3">
           <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
             <span className="text-lg text-slate-600">🔔</span>
             <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full ring-2 ring-white" />
           </button>
            <Link
              href="/dashboard/profile"
              className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden hover:ring-2 hover:ring-blue-600 transition-all"
            >
               {user?.profileImage ? (
                 <Image src={imageUrl(user.profileImage)!} alt="Profile" fill className="object-cover" />
               ) : (
                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              )}
            </Link>
         </div>
      </div>
    </header>
  );
}
