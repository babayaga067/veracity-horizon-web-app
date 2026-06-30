"use client";

import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";
import { Sidebar } from "@/app/(auth)/_components/Sidebar";
import CreateAuctionForm from "@/app/(auth)/_components/CreateAuctionForm";
import BackArrow from "@/app/(components)/BackArrow";

export default function CreateAuctionPage() {
  const { loading } = useAuthRedirect();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <BackArrow href="/dashboard/auctions" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Auction</h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">List a new item for auction</p>
            </div>
          </div>
          <CreateAuctionForm onSuccess={() => {
            window.location.href = "/dashboard/auctions";
          }} />
        </div>
      </main>
    </div>
  );
}