"use client";

import { useEffect, useState } from "react";

import { getStoredAuthUser } from "@/lib/auth";

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export function useAuthUser(): AuthUser {
  const [user, setUser] = useState<AuthUser>({});

  useEffect(() => {
    const stored = getStoredAuthUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  return user;
}
