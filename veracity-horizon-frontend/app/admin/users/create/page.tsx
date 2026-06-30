import BackArrow from "@/app/(components)/BackArrow";
import UserForm from "@/app/admin/_components/UserForm";

export default function CreateUserPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BackArrow href="/admin/users" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
          <p className="text-gray-500 mt-1 text-sm">Add a new user account to the system</p>
        </div>
      </div>
      <div className="max-w-3xl">
        <UserForm mode="create" />
      </div>
    </div>
  );
}
