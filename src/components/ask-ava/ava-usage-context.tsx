"use client";

import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";

import type { AvaUsage } from "./types";
import { apiClient } from "@/lib/api-client";

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
    try {
      const data = await apiClient.get<AvaUsage>(`/api/projects/${encodeURIComponent(projectId)}/ava/usage`);
      setUsage(data);
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
