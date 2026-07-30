"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { isAuthenticated } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/password-reset",
  "/auth/password-new",
  "/auth/activate",
  "/auth/terms-and-conditions",
  "/auth/privacy-policy",
  "/auth/get-verification",
  "/auth/set-verification",
  "/auth/password-sent",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPublicPath(pathname)) {
      return;
    }

    if (!isAuthenticated()) {
      router.replace("/auth/sign-in");
    }
  }, [pathname, router]);
}
