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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Manage user accounts and permissions</p>
      </div>

      <div className="glass-card rounded-3xl border border-white/50 overflow-hidden">
        <UserTable
          users={response.data.data}
          pagination={response.data.meta}
          search={searchValue}
        />
      </div>
    </div>
  );
}
