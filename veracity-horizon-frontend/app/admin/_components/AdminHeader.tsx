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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin/auctions" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Admin</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Veracity Horizon</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {adminNavItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
