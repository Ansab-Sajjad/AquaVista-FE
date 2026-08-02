"use client";

import { useEffect, useState } from "react";

import { getStoredAuthUser } from "@/lib/auth";

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
      const stored = getStoredAuthUser();
      setUser(stored ?? {});
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("auth-user-change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-user-change", loadUser);
    };
  }, []);

  return user;
}
