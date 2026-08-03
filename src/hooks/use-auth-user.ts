"use client";

import { useEffect, useState } from "react";

import { getStoredAuthToken, getStoredAuthUser, setAuthCookies } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
      const token = getStoredAuthToken();
      if (token) {
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.name) {
              setAuthCookies(token, data);
              setUser(data);
            }
          })
          .catch(() => {});
      }
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
