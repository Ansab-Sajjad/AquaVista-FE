"use client";

import Link from "next/link";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";

import { Settings } from "@mui/icons-material";
import { Box, Button, CircularProgress, LinearProgress, Typography } from "@mui/material";

import { AvaUsageProvider, useAvaUsage } from "@/components/ask-ava/ava-usage-context";
import StartupQuestionsDialog from "@/components/ask-ava/startup-questions-dialog";
import type { StartupQuestion } from "@/components/ask-ava/types";
import NiChartPie from "@/icons/nexture/ni-chart-pie";
import NiDatabase from "@/icons/nexture/ni-database";
import NiHome from "@/icons/nexture/ni-home";
import NiRobot from "@/icons/nexture/ni-robot";
import NiUsers from "@/icons/nexture/ni-users";
import { cn } from "@/lib/utils";
import { getStoredAuthToken, isAdminUser } from "@/lib/auth";

const PROJECT_TABS = [
  { id: "overview", label: "Overview", icon: NiHome, href: (id: string) => `/projects/${id}/overview` },
  { id: "dashboard", label: "Dashboard", icon: NiChartPie, href: (id: string) => `/projects/${id}/dashboard` },
  { id: "data", label: "Data", icon: NiDatabase, href: (id: string) => `/projects/${id}/data` },
  { id: "ask-ava", label: "Ask AVA", icon: NiRobot, href: (id: string) => `/projects/${id}/ask-ava` },
  { id: "users", label: "Users", icon: NiUsers, href: (id: string) => `/projects/${id}/users`, adminOnly: true },
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
  const projectId = (params?.id as string) || "";

  return (
    <AvaUsageProvider projectId={projectId}>
      <ProjectLayoutContent projectId={projectId}>{children}</ProjectLayoutContent>
    </AvaUsageProvider>
  );
}

function ProjectLayoutContent({ projectId, children }: PropsWithChildren<{ projectId: string }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = isAdminUser();
  const isAdminViewingUser = Boolean(searchParams.get("userId")) && isAdmin;
  const { usage } = useAvaUsage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [startupQuestions, setStartupQuestions] = useState<StartupQuestion[]>([]);
  const [startupDialogOpen, setStartupDialogOpen] = useState(false);

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

  const fetchStartupQuestions = useCallback(async () => {
    if (!projectId) return;
    const token = getStoredAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/startup-questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStartupQuestions(await res.json());
    } catch {
      // Non-critical; ignore
    }
  }, [projectId]);

  const handleSaveStartupQuestions = useCallback(
    async (questions: StartupQuestion[]) => {
      if (!projectId) return;
      const token = getStoredAuthToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/startup-questions`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions }),
      });
      if (!res.ok) throw new Error("Failed to save startup questions");
      const saved = await res.json();
      setStartupQuestions(saved);
    },
    [projectId],
  );

  useEffect(() => {
    if (isAdmin && projectId) {
      void fetchStartupQuestions();
    }
  }, [isAdmin, projectId, fetchStartupQuestions]);

  const VISIBLE_TABS = PROJECT_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  const activeTab =
    isAdminViewingUser
      ? "users"
      : PROJECT_TABS.find((tab) => pathname.includes(`/projects/${projectId}/${tab.id}`))?.id || "dashboard";

  const usagePercent = usage ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  return (
    <Box className="flex w-full flex-col gap-4 sm:flex-row sm:items-stretch">
      {!isAdminViewingUser && (
        <Box className="bg-background-paper shadow-darker-xs flex w-full shrink-0 flex-col gap-1 rounded-2xl p-4 sm:w-56">
          <Typography variant="caption" className="text-primary mb-1 px-2.5 font-semibold uppercase">
            {project?.name || "Project"}
          </Typography>
          {VISIBLE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                component={Link}
                href={tab.href(projectId)}
                variant="text"
                size="large"
                color="text-primary"
                className={cn(
                  "full-width-button group hover:bg-grey-25 px-4",
                  isActive && "active text-primary! bg-grey-25!",
                )}
                startIcon={<Icon variant={isActive ? "contained" : "outlined"} size="medium" />}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>
      )}

      <Box className={cn("bg-background-paper shadow-darker-xs w-full min-w-0 flex-1 rounded-2xl p-4 sm:p-6")}>
        {!isAdminViewingUser && (
          <Box className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
            <Box>
              <Typography variant="h5" component="h1" className="font-bold">
                {project?.name ? `${project.name} Workspace` : "Project Workspace"}
              </Typography>
              <Typography variant="caption" className="text-text-secondary">
                {loading ? <CircularProgress size={12} /> : <>ID: {projectId}</>}
              </Typography>
            </Box>
            <Box className="flex flex-col items-stretch gap-2 sm:items-end">
              {isAdmin && activeTab === "ask-ava" && (
                <Button
                  startIcon={<Settings />}
                  onClick={() => setStartupDialogOpen(true)}
                  variant="outlined"
                  color="grey"
                  size="small"
                  className="w-fit transition-transform duration-200 hover:scale-105"
                  sx={{
                    borderColor: "divider",
                    color: "text.primary",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  Startup questions
                </Button>
              )}
              {activeTab === "ask-ava" && usage ? (
                <Box className="w-full sm:w-48">
                  <Box className="mb-0.5 flex items-center justify-between">
                    <Typography variant="caption" className="text-text-secondary font-medium">
                      Ask AVA usage
                    </Typography>
                    <Typography
                      variant="caption"
                      className={cn("font-semibold", usage.limitReached ? "text-error" : "text-text-secondary")}
                    >
                      {usage.used}/{usage.limit}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={usagePercent}
                    color={usage.limitReached ? "error" : usagePercent >= 80 ? "warning" : "primary"}
                    className="rounded-full"
                    sx={{ height: 6, borderRadius: 999 }}
                  />
                </Box>
              ) : null}
            </Box>
          </Box>
        )}
        {children}
      </Box>

      {isAdmin ? (
        <StartupQuestionsDialog
          open={startupDialogOpen}
          questions={startupQuestions}
          onClose={() => setStartupDialogOpen(false)}
          onSave={handleSaveStartupQuestions}
        />
      ) : null}
    </Box>
  );
}
