"use client";

import Link from "next/link";

import { ChatOutlined, FolderOpenOutlined, GroupOutlined, PushPinOutlined, Update } from "@mui/icons-material";
import { Box, Breadcrumbs, Card, CardContent, Chip, Grid, Tooltip, Typography } from "@mui/material";

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
              <Card className="bg-grey-25 h-40 animate-pulse" />
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
                            variant="h5"
                            component="h3"
                            className="text-text-primary transition-colors duration-200"
                          >
                            {project.name}
                          </Typography>
                          <Typography variant="body2" className="text-text-secondary line-clamp-2 min-h-[2.5rem]">
                            {project.description || "No description provided."}
                          </Typography>
                          <Box className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
                            <Chip
                              label={project.municipality}
                              size="small"
                              color="primary"
                              className="transition-transform duration-200 hover:scale-105"
                            />
                            <Tooltip title={`${project.memberCount} member${project.memberCount !== 1 ? "s" : ""}`}>
                              <Box className="text-text-secondary hover:text-text-primary flex cursor-default items-center gap-1.5 transition-colors duration-200">
                                <GroupOutlined fontSize="small" />
                                <Typography variant="body2" component="span">
                                  {project.memberCount}
                                </Typography>
                              </Box>
                            </Tooltip>
                            <Tooltip title={`${project.dataFiles} file${project.dataFiles !== 1 ? "s" : ""}`}>
                              <Box className="text-text-secondary hover:text-text-primary flex cursor-default items-center gap-1.5 transition-colors duration-200">
                                <FolderOpenOutlined fontSize="small" />
                                <Typography variant="body2" component="span">
                                  {project.dataFiles}
                                </Typography>
                              </Box>
                            </Tooltip>
                            <Tooltip title={`${project.pinnedItems} pinned`}>
                              <Box className="text-text-secondary hover:text-text-primary flex cursor-default items-center gap-1.5 transition-colors duration-200">
                                <PushPinOutlined fontSize="small" />
                                <Typography variant="body2" component="span">
                                  {project.pinnedItems}
                                </Typography>
                              </Box>
                            </Tooltip>
                            <Tooltip title={`${project.chats} chat${project.chats !== 1 ? "s" : ""}`}>
                              <Box className="text-text-secondary hover:text-text-primary flex cursor-default items-center gap-1.5 transition-colors duration-200">
                                <ChatOutlined fontSize="small" />
                                <Typography variant="body2" component="span">
                                  {project.chats}
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
          </Box>
        </Grid>

        <Grid size={{ lg: 4, xs: 12 }}>
          <RecentActivity items={stats?.recentActivity ?? []} emptyMessage="No recent activity across your projects." />
        </Grid>
      </Grid>
    </Grid>
  );
}
