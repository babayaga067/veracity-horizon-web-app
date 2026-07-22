import { fetchUsersAction } from "@/app/lib/actions/admin-user-action";
import UserTable from "./_components/UserTable";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const { page, limit, search } = await searchParams;

  const pageNumber = parseInt(page || "1", 10);
  const limitNumber = parseInt(limit || "10", 10);
  const searchValue = search;

  const response = await fetchUsersAction(pageNumber, limitNumber, searchValue);

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch users");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage user accounts and permissions</p>
      </div>

      <UserTable
        users={response.data.data}
        pagination={response.data.meta}
        search={searchValue}
      />
    </div>
  );
}
