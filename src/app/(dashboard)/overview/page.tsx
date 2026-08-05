"use client";

import Link from "next/link";

import { Breadcrumbs, Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";

import RecentActivity from "@/components/stats/recent-activity";
import StatsGrid, { StatConfig } from "@/components/stats/stats-grid";
import { useGlobalStats } from "@/hooks/use-stats";

function formatDate(value?: string | null) {
  if (!value) return "Recently updated";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Recently updated";
  return d.toLocaleDateString();
}

export default function OverviewPage() {
  const { stats, loading, error } = useGlobalStats();

  const statCards: StatConfig[] = stats
    ? [
        {
          key: "projects",
          label: "Projects",
          value: stats.totals.projects,
          data: stats.trends.projects,
          plotType: "line",
        },
        {
          key: "members",
          label: "Team Members",
          value: stats.totals.members,
          data: Array(7).fill(stats.totals.members),
          plotType: "bar",
        },
        {
          key: "dataFiles",
          label: "Data Files",
          value: stats.totals.dataFiles,
          data: stats.trends.dataFiles,
          plotType: "line",
        },
        {
          key: "pinnedItems",
          label: "Pinned Insights",
          value: stats.totals.pinnedItems,
          data: stats.trends.pinnedItems,
          plotType: "bar",
        },
        {
          key: "chats",
          label: "AVA Chats",
          value: stats.totals.chats,
          data: stats.trends.chats,
          plotType: "line",
        },
        {
          key: "questions",
          label: "AVA Questions",
          value: stats.totals.questions,
          data: stats.trends.chats,
          plotType: "bar",
        },
      ]
    : [];

  return (
    <Grid container spacing={5}>
      <Grid container spacing={2.5} className="w-full" size={12}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Overview
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" href="/overview">
              Home
            </Link>
            <Typography variant="body2">Overview</Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>

      <Grid size={12}>
        <StatsGrid stats={statCards} loading={loading} error={error} title="Stats" />
      </Grid>

      <Grid container size={12} spacing={5}>
        <Grid size={{ lg: 8, xs: 12 }}>
          <Box className="flex flex-col gap-3">
            <Typography variant="h6" component="h6" className="mt-2 mb-1">
              Projects
            </Typography>
            {loading ? (
              <Card className="h-40 animate-pulse bg-grey-25" />
            ) : !stats || stats.projects.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Typography variant="body2" className="text-text-secondary">
                    No projects yet.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2.5}>
                {stats.projects.map((project, index) => (
                  <Grid
                    key={project.id}
                    size={{ xs: 12, md: 6 }}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${150 + index * 75}ms` }}
                  >
                    <Link
                      href={`/projects/${project.id}/overview`}
                      className="block h-full no-underline"
                    >
                      <Card className="bg-background-paper shadow-darker-xs h-full w-full cursor-pointer rounded-3xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1">
                        <CardContent className="flex h-full flex-col gap-3 p-6">
                          <Typography
                            variant="h5"
                            component="h3"
                            className="text-text-primary transition-colors duration-200"
                          >
                            {project.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            className="text-text-secondary line-clamp-2 min-h-[2.5rem]"
                          >
                            {project.description || "No description provided."}
                          </Typography>
                          <Box className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                            <Chip
                              label={project.municipality}
                              size="small"
                              color="primary"
                              className="transition-transform duration-200 hover:scale-105"
                            />
                            <Chip
                              label={`${project.memberCount} member${project.memberCount !== 1 ? "s" : ""}`}
                              size="small"
                              variant="outlined"
                              className="transition-transform duration-200 hover:scale-105"
                            />
                            <Chip
                              label={`${project.dataFiles} file${project.dataFiles !== 1 ? "s" : ""}`}
                              size="small"
                              variant="outlined"
                              className="transition-transform duration-200 hover:scale-105"
                            />
                            <Chip
                              label={`${project.pinnedItems} pinned`}
                              size="small"
                              variant="outlined"
                              className="transition-transform duration-200 hover:scale-105"
                            />
                            <Chip
                              label={`${project.chats} chat${project.chats !== 1 ? "s" : ""}`}
                              size="small"
                              variant="outlined"
                              className="transition-transform duration-200 hover:scale-105"
                            />
                            <Chip
                              label={`Updated ${formatDate(project.lastUpdated)}`}
                              size="small"
                              variant="outlined"
                              className="text-text-secondary transition-transform duration-200 hover:scale-105"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Grid>

        <Grid size={{ lg: 4, xs: 12 }}>
          <RecentActivity
            items={stats?.recentActivity ?? []}
            emptyMessage="No recent activity across your projects."
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
