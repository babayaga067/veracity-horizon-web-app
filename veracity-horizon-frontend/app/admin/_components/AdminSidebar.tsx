"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";

const adminNavItems = [
  { href: "/admin/auctions", label: "Auctions", key: "auctions", icon: "box" },
  { href: "/admin/users", label: "Users", key: "users", icon: "users" },
];

const getIcon = (name: string) => {
  const icons = {
    box: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
    </svg>,
    users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.646 4 4 0 11-5.646-4l-.5.646zM22 17H2v5a2 2 0 002 2h16a2 2 0 002-2v-5z" />
    </svg>,
  };
  return icons[name as keyof typeof icons] || null;
};

export default function AdminSidebar() {
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
    <aside className="fixed left-0 top-0 bottom-0 w-72 glass-dark z-50 flex flex-col border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin/auctions" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            A
          </div>
          <div>
            <p className="font-bold text-white text-xl tracking-tight">Admin</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Veracity Horizon</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminNavItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white shadow-lg shadow-black/10 border border-white/10"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {getIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0a9 9 0 01-18 0z" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-white font-semibold">{user?.firstName} {user?.lastName}</p>
              <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-indigo-500/20 text-indigo-300 mt-1">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
