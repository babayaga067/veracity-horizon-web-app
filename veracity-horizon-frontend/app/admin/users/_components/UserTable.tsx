"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/app/lib/types/user";
import { deleteAdminUser } from "@/app/lib/actions/admin-user-action";

interface UserTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  search?: string;
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRoleBadgeClass(role: string) {
  return role === "admin"
    ? "bg-purple-100 text-purple-800"
    : "bg-blue-100 text-blue-800";
}

export default function UserTable({ users, pagination, search }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(pagination.limit));
    if (value) {
      params.set("search", value);
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  const makePaginationLink = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pagination.limit));
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    return `/admin/users?${params.toString()}`;
  };

  const isPrevDisabled = pagination.page <= 1;
  const isNextDisabled = pagination.page >= pagination.totalPages;

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteAdminUser(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message || "Failed to delete user");
      }
    });
    setShowDeleteModal(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search users..."
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 w-64"
            />
            <Link href="/admin/users/create">
              <button className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id ?? `${user.email}-${user.username}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {(user.role || "user").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/users/${user._id}/edit`}>
                        <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-xs font-medium transition-colors">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(user._id)}
                        disabled={isPending}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.646 4 4 0 01-5.646-4l-.5.646zM22 17H2v5a2 2 0 002 2h16a2 2 0 002-2v-5z" />
            </svg>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-1">No users match your current search</p>
          </div>
        )}

        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {users.length > 0 && (
              <>Showing {users.length} of {pagination.total} users</>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Link
              href={makePaginationLink(pagination.page - 1)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                isPrevDisabled ? "pointer-events-none text-gray-300" : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm text-gray-600 px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Link
              href={makePaginationLink(pagination.page + 1)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                isNextDisabled ? "pointer-events-none text-gray-300" : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-slate-600 mb-4">This action cannot be undone. The user will be permanently removed.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteModal)}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
