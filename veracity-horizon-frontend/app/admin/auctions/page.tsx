import { fetchAuctionsAction } from "@/app/lib/actions/auction-action";
import AuctionTable from "./_components/AuctionTable";

export default async function AdminAuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string; status?: string }>;
}) {
  const { page, limit, search, status } = await searchParams;

  const pageNumber = parseInt(page || "1", 10);
  const limitNumber = parseInt(limit || "10", 10);
  const searchValue = search;
  const statusValue = status || "all";

  const response = await fetchAuctionsAction(pageNumber, limitNumber, searchValue);

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch auctions");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage all auctions in the system</p>
      </div>

      <AuctionTable
        auctions={response.data.data}
        pagination={response.data.meta}
        search={searchValue}
        status={statusValue}
      />
    </div>
  );
}
