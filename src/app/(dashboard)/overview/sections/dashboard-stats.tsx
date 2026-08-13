"use client";

import { useMemo } from "react";

import { Box, Card, CardContent, Typography } from "@mui/material";
import { Grid } from "@mui/material";

import StatsGrid, { StatConfig } from "@/components/stats/stats-grid";
import { useGlobalStats } from "@/hooks/use-stats";
import { DateRangeFilter, isWithinRange } from "@/lib/date-range-filter";

export default function DashboardStats({ dateRange }: { dateRange?: DateRangeFilter | null }) {
  const { stats, loading, error } = useGlobalStats();

  const filteredStats = useMemo(() => {
    if (!stats) return null;
    if (!dateRange) return stats;

    const filteredProjects = stats.projects.filter((p) => isWithinRange(p.lastUpdated, dateRange));

    return {
      ...stats,
      totals: {
        ...stats.totals,
        projects: filteredProjects.length,
        members: filteredProjects.reduce((sum, p) => sum + p.memberCount, 0),
        dataFiles: filteredProjects.reduce((sum, p) => sum + p.dataFiles, 0),
        pinnedItems: filteredProjects.reduce((sum, p) => sum + p.pinnedItems, 0),
        chats: filteredProjects.reduce((sum, p) => sum + p.chats, 0),
      },
    };
  }, [stats, dateRange]);

  const statCards: StatConfig[] = filteredStats
    ? [
        {
          key: "projects",
          label: "Projects",
          value: filteredStats.totals.projects,
          data: filteredStats.trends.projects,
          plotType: "line",
        },
        {
          key: "members",
          label: "Team Members",
          value: filteredStats.totals.members,
          data: Array(7).fill(filteredStats.totals.members),
          plotType: "bar",
        },
        {
          key: "dataFiles",
          label: "Data Files",
          value: filteredStats.totals.dataFiles,
          data: filteredStats.trends.dataFiles,
          plotType: "line",
        },
        {
          key: "pinnedItems",
          label: "Pinned Insights",
          value: filteredStats.totals.pinnedItems,
          data: filteredStats.trends.pinnedItems,
          plotType: "bar",
        },
      ]
    : [];

  if (loading) {
    return (
      <Box className="flex flex-col gap-3">
        <Typography variant="h6" component="h6" className="mt-2 mb-3">
          Stats
        </Typography>
        <Grid container spacing={2.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ lg: 3, md: 6, xs: 12 }}>
              <Card className="bg-grey-25 h-44 animate-pulse" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex flex-col gap-3">
        <Typography variant="h6" component="h6" className="mt-2 mb-3">
          Stats
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body2" className="text-error">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <StatsGrid stats={statCards} title="Stats" />;
}
