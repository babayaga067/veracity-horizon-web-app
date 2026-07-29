import { fetchAuctionByIdAction } from "@/app/lib/actions/auction-action";
import Link from "next/link";
import EditAuctionForm from "../../_components/EditAuctionForm";

export default async function EditAuctionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await fetchAuctionByIdAction(id);

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch auction");
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/auctions/${id}`}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Auction</h1>
          <p className="text-gray-500 mt-1 text-sm">Update auction information</p>
        </div>
      </div>
      <EditAuctionForm auction={response.data} />
    </div>
  );
}
