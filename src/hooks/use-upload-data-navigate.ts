"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { isAdminUser } from "@/lib/auth";

type ProjectOption = {
  id: string;
  name: string;
  municipality: string;
  description?: string | null;
};

/**
 * Handles the "Upload Data" navigation flow (admin only):
 * - non-admin   → no-op (project users cannot upload data files)
 * - 0 projects  → redirect to /projects so the admin can create one
 * - 1 project   → navigate directly to that project's Data tab
 * - >1 projects → open a picker modal; navigate once the admin selects one
 */
export function useUploadDataNavigate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadDataClick = useCallback(async () => {
    if (!isAdminUser()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<any[]>("/api/projects");

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
        router.push(`/projects/${list[0].id}/data`);
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
      router.push(`/projects/${projectId}/data`);
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
    handleUploadDataClick,
    handleSelectProject,
    handleClose,
  };
}
