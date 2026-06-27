"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/AuthContext";

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
    <header className="w-full glass-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/30 group-hover:shadow-lg transition-all">
            V
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Veracity<span className="text-blue-300">Horizon</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                activePage === link.key
                  ? "bg-white/15 text-white"
                  : "text-blue-100/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard/profile"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activePage === "profile"
                ? "bg-white/15 text-white"
                : "text-blue-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Profile
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors group">
            <span className="text-lg">🔔</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full ring-2 ring-slate-900" />
          </button>
          <Link
            href="/dashboard/profile"
            className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold text-xs overflow-hidden hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-slate-900 transition-all shadow-sm"
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
