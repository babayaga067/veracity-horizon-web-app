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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Auction Management</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Manage all auctions in the system</p>
      </div>

      <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
        <AuctionTable
          auctions={response.data.data}
          pagination={response.data.meta}
          search={searchValue}
          status={statusValue}
        />
      </div>
    </div>
  );
}
