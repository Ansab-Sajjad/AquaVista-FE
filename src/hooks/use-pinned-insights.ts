"use client";

import { useCallback, useEffect, useState } from "react";

import type { AvaChartData, AvaTableData } from "@/components/ask-ava/types";
import { apiClient } from "@/lib/api-client";

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

async function fetchProjects(): Promise<ProjectRef[]> {
  const data = await apiClient.get<any[]>("/api/projects");

  return (Array.isArray(data) ? data : []).map((item: any) => ({
    id: item.id || item._id,
    name: item.name,
    municipality: item.municipality,
  }));
}

async function fetchPinnedForProject(project: ProjectRef): Promise<PinnedInsight[]> {
  try {
    const data = await apiClient.get<RawPinnedItem[]>(
      `/api/projects/${encodeURIComponent(project.id)}/dashboard`,
    );

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
      const projects = await fetchProjects();

      if (projects.length === 0) {
        setInsights([]);
        return;
      }

      const results = await Promise.all(projects.map((project) => fetchPinnedForProject(project)));
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
