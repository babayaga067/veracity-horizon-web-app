"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";

export function useAuthRedirect() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return { user, loading, setUser };
}
