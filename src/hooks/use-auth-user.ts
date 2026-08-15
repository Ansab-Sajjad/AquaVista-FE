"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { getStoredAuthUser, setAuthUser } from "@/lib/auth";

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  image?: string;
  profileImage?: string;
}

export function useAuthUser(): AuthUser {
  const [user, setUser] = useState<AuthUser>({});

  useEffect(() => {
    const loadUser = () => {
      const updated = getStoredAuthUser();
      setUser(updated ?? {});
    };

    const stored = getStoredAuthUser();

    if (stored && !stored.name) {
      // Stored user is missing name — fetch fresh from API and update localStorage
      apiClient
        .get<AuthUser>("/api/auth/me")
        .then((data) => {
          if (data?.name) {
            setAuthUser(data as Record<string, unknown>);
            setUser(data);
          }
        })
        .catch(() => {});
    } else if (stored) {
      setUser(stored);
    }

    window.addEventListener("storage", loadUser);
    window.addEventListener("auth-user-change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-user-change", loadUser);
    };
  }, []);

  return user;
}
