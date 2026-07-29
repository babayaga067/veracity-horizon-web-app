"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  { href: "/admin/auctions", label: "Auctions", key: "auctions" },
  { href: "/admin/users", label: "Users", key: "users" },
];

export default function AdminHeader() {
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname === "/admin/auctions") return "auctions";
    if (pathname.startsWith("/admin/users")) return "users";
    if (pathname.startsWith("/admin/auctions/")) return "auctions";
    return pathname.split("/")[2] || "auctions";
  };

  const activeKey = getActiveKey();

  return (
    <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin/auctions" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
              A
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">Admin</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Veracity Horizon</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {adminNavItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
