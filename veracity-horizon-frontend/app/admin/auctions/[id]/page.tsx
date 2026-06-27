import { fetchAuctionByIdAction } from "@/app/lib/actions/auction-action";
import Link from "next/link";

function formatDate(date: Date | string | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "upcoming":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "open":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "closed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await fetchAuctionByIdAction(id);

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch auction");
  }

  const auction = response.data;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Details</h1>
          <p className="text-gray-500 mt-1 text-sm">View and manage auction information</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/auctions">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          </Link>
          <Link href={`/admin/auctions/${auction._id}/edit`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-14 0h16" />
              </svg>
              Edit Auction
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {auction.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusBadgeClass(auction.status)}`}>
                  {auction.status.toUpperCase()}
                </span>
                {auction.isFeatured && (
                  <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Featured
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{auction.title}</h2>
              <p className="text-gray-600 mt-2">{auction.description}</p>

              {auction.imageUrls && auction.imageUrls.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Images ({auction.imageUrls.length})</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {auction.imageUrls.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                        <img src={url} alt={`Auction image ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {auction.bids && auction.bids.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Bids ({auction.bids.length})</p>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Bidder</th>
                          <th className="px-4 py-2 text-right font-medium text-gray-500">Amount</th>
                          <th className="px-4 py-2 text-right font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {auction.bids.map((bid, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-gray-900">
                              {typeof bid.user === "object" 
                                ? `${(bid.user as { firstName?: string; lastName?: string }).firstName || ""} ${(bid.user as { firstName?: string; lastName?: string }).lastName || ""}`.trim()
                                : bid.user}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-900">रु {bid.amount}</td>
                            <td className="px-4 py-2 text-right text-gray-500">{formatDateTime(bid.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1 space-y-4">
              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Bid</p>
                <p className="text-3xl font-bold text-gray-900">रु {auction.currentBid || auction.startingPrice}</p>
                <p className="text-xs text-gray-500 mt-1">Starting: रु {auction.startingPrice}</p>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Seller</p>
                <p className="font-medium text-gray-900">{auction.owner.firstName} {auction.owner.lastName}</p>
                <p className="text-sm text-gray-600">{auction.owner.email}</p>
                <p className="text-xs text-gray-500">@{auction.owner.username}</p>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Timing</p>
                <p className="font-medium text-gray-900">End Date: {formatDate(auction.endsAt)}</p>
                <p className="text-sm text-gray-600">Status: {auction.status.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}