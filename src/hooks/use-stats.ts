"use client";

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";

export interface GlobalStats {
  totals: {
    projects: number;
    members: number;
    dataFiles: number;
    pinnedItems: number;
    chats: number;
    questions: number;
  };
  trends: {
    projects: number[];
    dataFiles: number[];
    pinnedItems: number[];
    chats: number[];
  };
  recentActivity: ActivityItem[];
  projects: ProjectSummary[];
}

export interface ProjectStats {
  totals: {
    members: number;
    dataFiles: number;
    pinnedItems: number;
    chats: number;
    questions: number;
    inputTokens: number;
    outputTokens: number;
  };
  trends: {
    dataFiles: number[];
    pinnedItems: number[];
    chats: number[];
    questions: number[];
  };
  dataFilesByType: { type: string; count: number }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  href?: string | null;
  projectId?: string | null;
  createdAt: string;
  actorName?: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  municipality: string;
  description?: string | null;
  memberCount: number;
  dataFiles: number;
  pinnedItems: number;
  chats: number;
  lastUpdated: string;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<GlobalStats>("/api/stats/overview");
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, loading, error, reload };
}

export function useProjectStats(projectId: string | null | undefined) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ProjectStats>(
        `/api/projects/${encodeURIComponent(projectId)}/stats`,
      );
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load statistics.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, loading, error, reload };
}
