"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EditUserForm from "@/app/admin/_components/UserForm";
import { fetchUserByIdAction } from "@/app/lib/actions/admin-user-action";
import type { User } from "@/app/lib/types/user";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const result = await fetchUserByIdAction(params.id);
        if (result.success && result.data) {
          setInitialData(result.data);
        } else {
          setError(result.message || "User not found");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card border-red-200 rounded-2xl p-5 text-red-700">
          <p className="font-bold">{error || "User not found"}</p>
          <Link href="/admin/users" className="btn-outline mt-4 inline-block px-4 py-2 text-sm font-bold rounded-xl">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <EditUserForm mode="edit" user={initialData} />
    </div>
  );
}