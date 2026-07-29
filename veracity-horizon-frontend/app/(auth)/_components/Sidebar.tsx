"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";
import { imageUrl } from "@/app/lib/api/config";
import { useState } from "react";
import { useDarkMode } from "./DarkModeToggle";
import AISearchBar from "./AISearchBar";

const navItems = [
  { href: "/market", label: "Marketplace", key: "market" },
  { href: "/dashboard", label: "Dashboard", key: "home" },
  { href: "/dashboard/auctions", label: "My Auctions", key: "auctions" },
  { href: "/dashboard/bids", label: "Bid History", key: "bids" },
  { href: "/dashboard/won-auctions", label: "Won Auctions", key: "won" },
  { href: "/portfolio", label: "Portfolio", key: "portfolio" },
  { href: "/dashboard/profile", label: "Profile", key: "profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isDark, toggleDarkMode } = useDarkMode();

  const getActiveKey = () => {
    if (pathname === "/dashboard") return "home";
    if (pathname.startsWith("/dashboard/profile")) return "profile";
    if (pathname.startsWith("/dashboard/won-auctions")) return "won";
    if (pathname.startsWith("/dashboard/auctions/")) return "auctions";
    if (pathname === "/dashboard/auctions") return "auctions";
    if (pathname === "/market") return "market";
    if (pathname === "/portfolio") return "portfolio";
    for (const item of navItems) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return item.key;
      }
    }
    return pathname.split("/")[1] || "home";
  };

  const activeKey = getActiveKey();

  const toggleMobile = () => setMobileOpen((prev) => !prev);

  return (
    <>
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-[60] lg:hidden w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 glass-dark z-50 flex flex-col border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
              V
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">Veracity</p>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold">Horizon</p>
            </div>
          </Link>
        </div>

        {/* AI Search */}
        <div className="p-4 border-b border-white/10">
          <AISearchBar className="w-full" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-black/10 border border-white/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-medium overflow-hidden relative ring-2 ring-white/20">
              {user?.profileImage ? (
                <Image src={imageUrl(user.profileImage)!} alt="Profile" fill className="object-cover" />
              ) : (
                <svg className="w-4 h-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.25h15.002c.966 0 1.75-.784 1.75-1.75v-7.5c0-1.192-.784-2.193-1.842-2.43a1.75 1.75 0 00-1.816 0c-.31.123-.662.178-1.018.178H6.076c-.356 0-.707-.055-1.018-.178A1.75 1.75 0 003.25 11.25v7.5c0 .966.784 1.75 1.75 1.75z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-white font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}