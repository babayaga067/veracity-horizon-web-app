import { ReactNode } from "react";
import { AdminSidebar } from "./_components/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900">
      <AdminSidebar />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}