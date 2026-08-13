"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getStoredAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ProjectOption = {
  id: string;
  name: string;
  municipality: string;
  description?: string | null;
};

/**
 * Handles the "Ask AVA" navigation flow:
 * - 0 projects → redirect to /projects so the user can create one
 * - 1 project  → navigate directly to that project's Ask AVA tab
 * - >1 projects → open a picker modal; navigate once the user selects one
 */
export function useAskAvaNavigate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskAvaClick = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
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

      const list: ProjectOption[] = Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id || item._id,
            name: item.name,
            municipality: item.municipality,
            description: item.description,
          }))
        : [];

      if (list.length === 0) {
        router.push("/projects");
        return;
      }

      if (list.length === 1) {
        router.push(`/projects/${list[0].id}/ask-ava`);
        return;
      }

      setProjects(list);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSelectProject = useCallback(
    (projectId: string) => {
      setOpen(false);
      router.push(`/projects/${projectId}/ask-ava`);
    },
    [router],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    projects,
    loading,
    error,
    handleAskAvaClick,
    handleSelectProject,
    handleClose,
  };
}
