"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";
import { imageUrl } from "@/app/lib/api/config";

const navItems = [
  { href: "/dashboard", label: "Dashboard", key: "home" },
  { href: "/market", label: "Marketplace", key: "market" },
  { href: "/dashboard/auctions", label: "My Auctions", key: "auctions" },
  { href: "/portfolio", label: "Portfolio", key: "portfolio" },
  { href: "/dashboard/profile", label: "Profile", key: "profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getActiveKey = () => {
    if (pathname === "/dashboard") return "home";
    if (pathname.startsWith("/dashboard/profile")) return "profile";
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

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
            V
          </div>
          <div>
            <p className="font-bold text-gray-900">Veracity</p>
            <p className="text-xs text-gray-500 uppercase">Horizon</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
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
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium overflow-hidden relative">
            {user?.profileImage ? (
              <Image src={imageUrl(user.profileImage)!} alt="Profile" fill className="object-cover" />
            ) : (
              <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-gray-900 font-medium text-sm">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 uppercase">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}