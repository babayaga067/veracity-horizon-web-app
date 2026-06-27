import { fetchAuctionsAction } from "@/app/lib/actions/auction-action";
import AuctionTable from "./_components/AuctionTable";

export default async function AdminAuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string; search?: string }>;
}) {
  const { page, size, search } = await searchParams;

  const pageNumber = parseInt(page || "1", 10);
  const sizeNumber = parseInt(size || "10", 10);
  const searchValue = search;

  const response = await fetchAuctionsAction({
    page: pageNumber,
    size: sizeNumber,
    search: searchValue,
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch auctions");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage all auctions in the system</p>
        </div>

        <AuctionTable
          auctions={response.data.data}
          pagination={response.data.meta}
          search={searchValue}
        />
      </div>
    </div>
  );
}