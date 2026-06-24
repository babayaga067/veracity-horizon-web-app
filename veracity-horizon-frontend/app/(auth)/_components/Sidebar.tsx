"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", key: "home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/market", label: "Market", key: "market", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { href: "/dashboard/auctions", label: "Auctions", key: "auctions", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { href: "/portfolio", label: "Portfolio", key: "portfolio", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/dashboard/profile", label: "Profile", key: "profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getActiveKey = () => {
    if (pathname === "/dashboard") return "home";
    if (pathname.startsWith("/dashboard/profile")) return "profile";
    if (pathname.startsWith("/dashboard/auctions/")) return "auctions";
    for (const item of navItems) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return item.key;
      }
    }
    return pathname.split("/")[1] || "home";
  };

  const activeKey = getActiveKey();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 z-50 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="p-6 border-b border-gray-50/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/25 group-hover:shadow-xl group-hover:shadow-blue-600/30 transition-all">
            V
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900 block">Veracity</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Horizon</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                isActive
                  ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
              )}
              <svg className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50/80">
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile")
              ? "bg-blue-50/80 text-blue-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-sm">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-slate-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-semibold">{user?.role}</p>
          </div>
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </aside>
  );
}
