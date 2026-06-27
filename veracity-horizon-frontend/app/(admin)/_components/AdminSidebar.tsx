"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";

const adminNavItems = [
  { href: "/admin/auctions", label: "Auctions", key: "auctions" },
  { href: "/admin/users", label: "Users", key: "users" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getActiveKey = () => {
    if (pathname === "/admin/auctions") return "auctions";
    if (pathname.startsWith("/admin/users")) return "users";
    if (pathname.startsWith("/admin/auctions/")) return "auctions";
    return pathname.split("/")[2] || "auctions";
  };

  const activeKey = getActiveKey();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <p className="font-bold text-gray-900">Admin Panel</p>
            <p className="text-xs text-gray-500 uppercase">Veracity Horizon</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-gray-900 font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 uppercase">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}