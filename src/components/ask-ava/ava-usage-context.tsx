"use client";

import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";

import type { AvaUsage } from "./types";
import { getStoredAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AvaUsageContextValue = {
  usage: AvaUsage | null;
  setUsage: (usage: AvaUsage | null) => void;
  refreshUsage: () => Promise<void>;
};

const AvaUsageContext = createContext<AvaUsageContextValue | null>(null);

export function AvaUsageProvider({ projectId, children }: PropsWithChildren<{ projectId: string }>) {
  const [usage, setUsage] = useState<AvaUsage | null>(null);

  const refreshUsage = useCallback(async () => {
    if (!projectId) return;
    const token = getStoredAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsage(await res.json());
    } catch {
      // Usage is non-critical; ignore
    }
  }, [projectId]);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  return <AvaUsageContext.Provider value={{ usage, setUsage, refreshUsage }}>{children}</AvaUsageContext.Provider>;
}

export const useAvaUsage = () => {
  const context = useContext(AvaUsageContext);
  if (!context) {
    throw new Error("useAvaUsage must be used within an AvaUsageProvider");
  }
  return context;
};
