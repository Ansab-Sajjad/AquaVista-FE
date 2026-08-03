"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  memberCount: number;
  dataFiles: number;
  pinnedItems: number;
  chats: number;
  lastUpdated: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const token = getStoredAuthToken();
  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || "Unable to load statistics.");
  }
  return data as T;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<GlobalStats>(`${API_BASE_URL}/api/stats/overview`);
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
      const data = await fetchJson<ProjectStats>(
        `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/stats`,
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
