import { fetchAuctionByIdAction } from "@/app/lib/actions/auction-action";
import EditAuctionForm from "../../_components/EditAuctionForm";
import Link from "next/link";

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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Auction</h1>
          <p className="text-gray-500 mt-1 text-sm">Update auction information</p>
        </div>
        <Link href="/admin/auctions">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Auctions
          </button>
        </Link>
      </div>
      <EditAuctionForm auction={response.data} />
    </div>
  );
}