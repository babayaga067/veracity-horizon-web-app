import BackArrow from "@/app/(components)/BackArrow";
import UserForm from "@/app/admin/_components/UserForm";
import { fetchUserByIdAction } from "@/app/lib/actions/admin-user-action";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const response = await fetchUserByIdAction(id);

  if (!response.success || !response.data) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BackArrow href="/admin/users" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-500 mt-1 text-sm">Update user account details</p>
          </div>
        </div>
        <div className="max-w-3xl">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 text-sm">{response.message || "User not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const user = response.data;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BackArrow href="/admin/users" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-500 mt-1 text-sm">Update user account details</p>
        </div>
      </div>
      <div className="max-w-3xl">
        <UserForm mode="edit" user={user} />
      </div>
    </div>
  );
}
