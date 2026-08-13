"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { FolderOpenOutlined, GroupOutlined, Update } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";

import CreateProjectDialog, { CreatedProject } from "@/components/create-project-dialog";
import StatsGrid, { StatConfig } from "@/components/stats/stats-grid";
import { useGlobalStats } from "@/hooks/use-stats";
import { getStoredAuthToken, isAdminUser } from "@/lib/auth";

type Project = {
  id: string;
  name: string;
  municipality: string;
  description?: string;
  teamCount: number;
  fileCount: number;
  lastUpdated?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = isAdminUser();
  const { stats: globalStats, loading: statsLoading, error: statsError } = useGlobalStats();

  const statCards: StatConfig[] = globalStats
    ? [
        {
          key: "projects",
          label: "Projects",
          value: globalStats.totals.projects,
          data: globalStats.trends.projects,
          plotType: "line",
        },
        {
          key: "members",
          label: "Team Members",
          value: globalStats.totals.members,
          data: Array(7).fill(globalStats.totals.members),
          plotType: "bar",
        },
        {
          key: "dataFiles",
          label: "Data Files",
          value: globalStats.totals.dataFiles,
          data: globalStats.trends.dataFiles,
          plotType: "line",
        },
        {
          key: "pinnedItems",
          label: "Pinned Insights",
          value: globalStats.totals.pinnedItems,
          data: globalStats.trends.pinnedItems,
          plotType: "bar",
        },
      ]
    : [];

  const loadProjects = useCallback(async () => {
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

      setProjects(
        Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id || item._id,
              name: item.name,
              municipality: item.municipality,
              description: item.description,
              teamCount: item.teamCount ?? 0,
              fileCount: item.fileCount ?? 0,
              lastUpdated: item.lastUpdated || item.updatedAt,
            }))
          : [],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleProjectCreated = (created: CreatedProject) => {
    setProjects((prev) => [
      {
        id: created.id,
        name: created.name,
        municipality: created.municipality,
        description: created.description,
        teamCount: created.teamCount,
        fileCount: created.fileCount,
        lastUpdated: created.lastUpdated,
      },
      ...prev,
    ]);
    setOpen(false);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Recently updated";

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "Recently updated";

    return parsedDate.toLocaleDateString();
  };

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Box className="space-y-1">
          <Typography variant="h2" component="h1" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            Projects
          </Typography>
          <Typography
            variant="body1"
            className="text-text-secondary animate-in fade-in slide-in-from-bottom-2 delay-75 duration-500"
          >
            Select a municipal rate study project to open its workspace.
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            className="animate-in fade-in slide-in-from-right delay-150 duration-500"
          >
            Create Project
          </Button>
        )}
      </Box>

      <Box className="animate-in fade-in slide-in-from-bottom-3 delay-100 duration-500">
        <StatsGrid stats={statCards} loading={statsLoading} error={statsError} title="Overview" />
      </Box>

      {error && (
        <Alert severity="error" className="bg-background-paper/70 animate-in fade-in slide-in-from-top-2 duration-300">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box className="bg-background-paper shadow-darker-xs animate-in fade-in flex items-center justify-center rounded-4xl p-12 duration-300">
          <CircularProgress size={28} />
        </Box>
      ) : projects.length === 0 ? (
        <Box className="bg-background-paper shadow-darker-xs animate-in fade-in zoom-in-95 flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center duration-500">
          <Typography variant="h4">No projects yet</Typography>
          <Typography variant="body1" className="text-text-secondary max-w-md">
            {isAdmin
              ? "Create a project to start a municipal rate study."
              : "You have not been added to any projects yet. Contact your AquaVista consultant."}
          </Typography>
          {isAdmin && (
            <Button variant="contained" onClick={() => setOpen(true)} className="mt-2">
              Create Project
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project, index) => (
            <Grid
              key={project.id}
              size={{ xs: 12, md: 6, lg: 6 }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${150 + index * 75}ms` }}
            >
              <Link href={`/projects/${project.id}/overview`} className="block h-full no-underline">
                <Card
                  className="h-full w-full cursor-pointer rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg"
                  sx={{
                    background:
                      "linear-gradient(145deg, hsl(var(--background-paper) / 0.92), hsl(var(--background-paper) / 0.78))",
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <Typography
                      variant="h6"
                      component="h3"
                      className="text-text-primary transition-colors duration-200"
                    >
                      {project.name}
                    </Typography>
                    {(() => {
                      const fullDescription = project.description || "No description provided.";
                      const isLong = (project.description?.length ?? 0) > 200;
                      const description = isLong
                        ? `${fullDescription.slice(0, 200).trimEnd()}...`
                        : fullDescription;
                      const descriptionNode = (
                        <Typography
                          variant="body2"
                          className="text-text-secondary min-h-10 max-h-10 overflow-hidden leading-5"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {description}
                        </Typography>
                      );
                      return isLong ? (
                        <Tooltip title={project.description} arrow placement="top">
                          {descriptionNode}
                        </Tooltip>
                      ) : (
                        descriptionNode
                      );
                    })()}
                    <Box className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
                      <Chip
                        label={project.municipality}
                        size="small"
                        color="primary"
                        className="transition-transform duration-200 hover:scale-105"
                      />
                      <Tooltip title={`${project.teamCount} member${project.teamCount !== 1 ? "s" : ""}`}>
                        <Box className="text-text-secondary hover:text-text-primary flex cursor-default items-center gap-1.5 transition-colors duration-200">
                          <GroupOutlined fontSize="small" />
                          <Typography variant="body2" component="span">
                            {project.teamCount}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`${project.fileCount} file${project.fileCount !== 1 ? "s" : ""}`}>
                        <Box className="text-text-secondary hover:text-text-primary flex cursor-default items-center gap-1.5 transition-colors duration-200">
                          <FolderOpenOutlined fontSize="small" />
                          <Typography variant="body2" component="span">
                            {project.fileCount}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`Updated ${formatDate(project.lastUpdated)}`}>
                        <Box className="text-text-secondary hover:text-text-primary flex cursor-default items-center gap-1.5 transition-colors duration-200">
                          <Update fontSize="small" />
                          <Typography variant="body2" component="span">
                            {formatDate(project.lastUpdated)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateProjectDialog open={open} onClose={() => setOpen(false)} onCreated={handleProjectCreated} />
    </Box>
  );
}
