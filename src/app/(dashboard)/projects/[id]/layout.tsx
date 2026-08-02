"use client";

import Link from "next/link";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

import { Box, Button, CircularProgress, Tab, Tabs, Typography } from "@mui/material";

import { cn } from "@/lib/utils";
import { getStoredAuthToken, isAdminUser } from "@/lib/auth";

const PROJECT_TABS = [
  { id: "dashboard", label: "Dashboard", href: (id: string) => `/projects/${id}/dashboard` },
  { id: "data", label: "Data", href: (id: string) => `/projects/${id}/data` },
  { id: "ask-ava", label: "Ask AVA", href: (id: string) => `/projects/${id}/ask-ava` },
  { id: "users", label: "Users", href: (id: string) => `/projects/${id}/users`, adminOnly: true },
];

type Project = {
  id: string;
  name: string;
  municipality: string;
  description?: string;
  teamCount: number;
  lastUpdated?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProjectLayout({ children }: PropsWithChildren) {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = (params?.id as string) || "";
  const isAdmin = isAdminUser();
  const isAdminViewingUser = Boolean(searchParams.get("userId")) && isAdmin;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const token = getStoredAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        });

        const data = await response.json().catch(() => null);
        if (response.ok && data) {
          setProject({
            id: data.id || data._id,
            name: data.name,
            municipality: data.municipality,
            description: data.description,
            teamCount: data.teamCount ?? 0,
            lastUpdated: data.lastUpdated || data.updatedAt,
          });
        }
      } catch {
        // Silently fail - project name will just not show
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  const VISIBLE_TABS = PROJECT_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  const activeTab =
    isAdminViewingUser
      ? "users"
      : PROJECT_TABS.find((tab) => pathname.includes(`/projects/${projectId}/${tab.id}`))?.id || "dashboard";

  return (
    <Box className="flex w-full flex-col gap-4">
      {!isAdminViewingUser && (
        <Box className="bg-background-paper shadow-darker-xs flex flex-col gap-4 rounded-3xl p-5 sm:p-6">
          <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Box>
              <Typography variant="h3" component="h1">
                {project?.name ? `${project.name} Workspace` : "Project Workspace"}
              </Typography>
              <Typography variant="body2" className="text-text-secondary">
                {loading ? (
                  <CircularProgress size={14} />
                ) : project ? (
                  <>
                    ID: {projectId}
                  </>
                ) : (
                  <>ID: {projectId}</>
                )}
              </Typography>
            </Box>
            <Button component={Link} href="/projects" variant="outlined" color="grey" size="small">
              Back to Projects
            </Button>
          </Box>

          <Tabs
            value={activeTab}
            textColor="primary"
            indicatorColor="primary"
            className="min-h-12"
          >
            {VISIBLE_TABS.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={tab.label}
                component={Link}
                href={tab.href(projectId)}
                className={cn(
                  "normal-case rounded-t-lg px-4 py-2 text-sm font-semibold",
                  activeTab === tab.id ? "text-primary" : "text-text-secondary",
                )}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <Box className="w-full">{children}</Box>
    </Box>
  );
}
