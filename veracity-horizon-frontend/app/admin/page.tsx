import { fetchAuctionsAction } from "@/app/lib/actions/auction-action";
import { fetchUsersAction } from "@/app/lib/actions/admin-user-action";
import AuctionTable from "./auctions/_components/AuctionTable";
import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/app/lib/api/config";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string; status?: string }>;
}) {
  const { page, limit, search, status } = await searchParams;

  const pageNumber = parseInt(page || "1", 10);
  const limitNumber = parseInt(limit || "10", 10);
  const searchValue = search;
  const statusValue = status || "all";

  const [auctionsRes, usersRes] = await Promise.all([
    fetchAuctionsAction(1, 100),
    fetchUsersAction(1, 100),
  ]);

  const auctions = auctionsRes.success && auctionsRes.data ? auctionsRes.data.data : [];
  const users = usersRes.success && usersRes.data ? usersRes.data.data : [];

  const totalAuctions = auctions.length;
  const activeAuctions = auctions.filter((a) => a.status === "active" || a.status === "open").length;
  const totalBids = auctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0);
  const totalValue = auctions.reduce((sum, a) => sum + (a.currentBid || a.startingPrice || 0), 0);
   const featuredCount = auctions.filter((a) => a.isFeatured).length;
   const totalUsers = users.length;

   const categoryMap: Record<string, number> = {};
   auctions.forEach((a) => {
     categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
   });
   const categoryStats = Object.entries(categoryMap)
     .map(([name, count]) => ({ name, count }))
     .sort((a, b) => b.count - a.count)
     .slice(0, 6);
   const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1);

   const recentAuctions = [...auctions]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Overview of your auction platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalAuctions}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Auctions</p>
        </div>

        <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Live</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeAuctions}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Active Auctions</p>
        </div>

        <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0a9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">Bids</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalBids}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Bids Placed</p>
        </div>

        <div className="glass-card rounded-3xl border border-white/50 p-6 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Value</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">रु {totalValue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Platform Value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-3xl border border-white/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 bg-white/30">
            <h2 className="text-lg font-bold text-slate-900">Recent Auctions</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Latest listings across all categories</p>
          </div>
          <div className="divide-y divide-white/50">
            {recentAuctions.map((auction) => (
              <div key={auction._id} className="flex items-center gap-4 p-4 hover:bg-white/40 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                  {imageUrl((auction.imageUrls as string[] | undefined)?.[0]) ? (
                    <Image src={imageUrl((auction.imageUrls as string[] | undefined)?.[0])!} alt={auction.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 truncate">{auction.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{auction.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">Current</p>
                      <p className="text-sm font-bold text-slate-900">रु {(auction.currentBid || auction.startingPrice).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  auction.status === "active" || auction.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  auction.status === "closed" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-50 text-blue-700 border-blue-100"
                }`}>
                  {(auction.status || "upcoming").toUpperCase()}
                </span>
              </div>
            ))}
            {recentAuctions.length === 0 && (
              <div className="p-8 text-center text-slate-500">No recent auctions</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2.5 border-b border-white/30">
                <span className="text-sm text-slate-600 font-medium">Total Users</span>
                <span className="font-bold text-slate-900">{totalUsers}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-white/30">
                <span className="text-sm text-slate-600 font-medium">Featured Listings</span>
                <span className="font-bold text-slate-900">{featuredCount}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-white/30">
                <span className="text-sm text-slate-600 font-medium">Avg. Bid Value</span>
                <span className="font-bold text-slate-900">रु {totalBids > 0 ? Math.round(totalValue / totalBids).toLocaleString() : "0"}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-600 font-medium">Categories Used</span>
                <span className="font-bold text-slate-900">{new Set(auctions.map((a) => a.category)).size}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Category Distribution</h3>
            <div className="space-y-3">
              {categoryStats.length > 0 ? (
                categoryStats.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-600 truncate pr-2 font-medium">{cat.name}</span>
                      <span className="text-xs font-bold text-slate-900">{cat.count}</span>
                    </div>
                    <div className="w-full bg-slate-100/80 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No category data available</p>
              )}
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/50 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentAuctions.slice(0, 5).map((auction) => (
                <div key={auction._id} className="flex items-center gap-3 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-16L4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">New auction: {auction.title}</p>
                    <p className="text-xs text-slate-500">{auction.category} · रु {(auction.currentBid || auction.startingPrice).toLocaleString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    auction.status === "active" || auction.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    auction.status === "closed" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {(auction.status || "upcoming").toUpperCase()}
                  </span>
                </div>
              ))}
              {recentAuctions.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/50 p-6 bg-gradient-to-br from-blue-600/90 to-indigo-700/90">
            <h3 className="text-lg font-bold text-white mb-2">Quick Actions</h3>
            <p className="text-blue-100 text-sm mb-4">Manage your platform efficiently</p>
            <div className="space-y-3">
              <Link href="/admin/auctions/create" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all border border-white/10">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-bold text-white">Create New Auction</span>
              </Link>
              <Link href="/admin/users/create" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all border border-white/10">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-bold text-white">Add New User</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
