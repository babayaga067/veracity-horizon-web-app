"use client";

import AdminHeader from "./_components/AdminHeader";
import AdminSidebar from "./_components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen animated-gradient font-sans antialiased text-slate-900 overflow-x-hidden">
      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl float pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float-delayed pointer-events-none"></div>

      <AdminSidebar />
      <div className="flex-1 ml-72 relative z-10">
        <AdminHeader />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
