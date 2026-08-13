"use client";

import { useCallback, useEffect, useState } from "react";

import type { AvaChartData, AvaTableData } from "@/components/ask-ava/types";
import { getStoredAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type PinnedInsightType = "narrative" | "table" | "chart";

export interface PinnedInsight {
  id: string;
  type: PinnedInsightType;
  title: string;
  sourceQuestion: string;
  createdBy: string;
  createdAt: string;
  content: string;
  tableData?: AvaTableData | AvaTableData[];
  chartData?: AvaChartData;
  scope?: "global" | "private";
  canUnpin?: boolean;
  projectId: string;
  projectName: string;
  projectMunicipality: string;
}

interface ProjectRef {
  id: string;
  name: string;
  municipality: string;
}

interface RawPinnedItem {
  id: string;
  type: PinnedInsightType;
  title: string;
  sourceQuestion: string;
  createdBy: string;
  createdAt: string;
  content: string;
  tableData?: AvaTableData | AvaTableData[];
  chartData?: AvaChartData;
  scope?: "global" | "private";
  canUnpin?: boolean;
}

async function fetchProjects(token: string | null): Promise<ProjectRef[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data?.message || "Unable to load projects.");
  }

  return (Array.isArray(data) ? data : []).map((item: any) => ({
    id: item.id || item._id,
    name: item.name,
    municipality: item.municipality,
  }));
}

async function fetchPinnedForProject(project: ProjectRef, token: string | null): Promise<PinnedInsight[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(project.id)}/dashboard`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) return [];

    const data = (await response.json()) as RawPinnedItem[];
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      ...item,
      projectId: project.id,
      projectName: project.name,
      projectMunicipality: project.municipality,
    }));
  } catch {
    return [];
  }
}

export function usePinnedInsights() {
  const [insights, setInsights] = useState<PinnedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      const projects = await fetchProjects(token);

      if (projects.length === 0) {
        setInsights([]);
        return;
      }

      const results = await Promise.all(projects.map((project) => fetchPinnedForProject(project, token)));
      const all = results.flat().sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setInsights(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load pinned insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { insights, loading, error, reload };
}
