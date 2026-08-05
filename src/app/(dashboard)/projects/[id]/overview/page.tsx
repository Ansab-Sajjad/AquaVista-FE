"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Box, Button, Card, CardContent, Chip, Grid, Typography } from "@mui/material";

import RecentActivity from "@/components/stats/recent-activity";
import StatsGrid, { StatConfig } from "@/components/stats/stats-grid";
import { useProjectStats } from "@/hooks/use-stats";

const DATA_FILE_TYPE_COLORS: Record<string, "primary" | "secondary" | "success" | "warning" | "error" | "info"> = {
  "Financial Snapshot": "primary",
  "Customer Allocation / Billing Data": "secondary",
  "CIP Register": "info",
  "Rate Table": "success",
  Demographics: "warning",
  "Budget / Audit Data": "error",
  "Rate Resolution": "primary",
};

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const { stats, loading, error } = useProjectStats(projectId);

  const statCards: StatConfig[] = stats
    ? [
        {
          key: "members",
          label: "Team Members",
          value: stats.totals.members,
          data: Array(7).fill(stats.totals.members),
          plotType: "line",
        },
        {
          key: "dataFiles",
          label: "Data Files",
          value: stats.totals.dataFiles,
          data: stats.trends.dataFiles,
          plotType: "bar",
        },
        {
          key: "pinnedItems",
          label: "Pinned Insights",
          value: stats.totals.pinnedItems,
          data: stats.trends.pinnedItems,
          plotType: "line",
        },
        {
          key: "questions",
          label: "AVA Questions",
          value: stats.totals.questions,
          data: stats.trends.questions,
          plotType: "bar",
        },
      ]
    : [];

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
        <Typography variant="h4" component="h2">
          Overview
        </Typography>
        <Button
          component={Link}
          href={`/projects/${projectId}/ask-ava`}
          variant="contained"
          size="small"
          className="transition-transform duration-200 hover:scale-105"
        >
          Ask AVA
        </Button>
      </Box>

      <Box className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
        <StatsGrid stats={statCards} loading={loading} error={error} title="Stats" />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ lg: 8, xs: 12 }}>
          <Box className="flex flex-col gap-3">
            <Typography variant="h6" component="h6" className="mt-2 mb-1 animate-in fade-in slide-in-from-left-2 duration-500 delay-150">
              Data Files by Type
            </Typography>
            {loading ? (
              <Card className="h-32 animate-pulse bg-grey-25 rounded-3xl" />
            ) : !stats || stats.dataFilesByType.length === 0 ? (
              <Card className="animate-in fade-in slide-in-from-left-3 duration-500 delay-200">
                <CardContent className="p-6 text-center">
                  <Typography variant="body2" className="text-text-secondary">
                    No data files uploaded yet.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card className="transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-left-3 duration-500 delay-200">
                <CardContent className="flex flex-wrap gap-2 p-5">
                  {stats.dataFilesByType.map((entry, index) => (
                    <Chip
                      key={entry.type}
                      label={`${entry.type}: ${entry.count}`}
                      color={DATA_FILE_TYPE_COLORS[entry.type] ?? "default"}
                      variant="outlined"
                      className="transition-transform duration-200 hover:scale-105 animate-in fade-in zoom-in-95"
                      style={{ animationDelay: `${250 + index * 50}ms`, animationDuration: "300ms" }}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            <Box className="mt-2">
              <Typography variant="h6" component="h6" className="mt-2 mb-3 animate-in fade-in slide-in-from-left-2 duration-500 delay-300">
                Token Usage
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-350">
                    <CardContent className="flex flex-col gap-1">
                      <Typography variant="body1" className="text-text-secondary-dark">
                        Input Tokens
                      </Typography>
                      <Typography variant="h5" className="text-text-primary">
                        {stats ? formatTokens(stats.totals.inputTokens) : "—"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-400">
                    <CardContent className="flex flex-col gap-1">
                      <Typography variant="body1" className="text-text-secondary-dark">
                        Output Tokens
                      </Typography>
                      <Typography variant="h5" className="text-text-primary">
                        {stats ? formatTokens(stats.totals.outputTokens) : "—"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ lg: 4, xs: 12 }}>
          <Box className="animate-in fade-in slide-in-from-right-3 duration-500 delay-250">
            <RecentActivity
              items={stats?.recentActivity ?? []}
              emptyMessage="No project activity yet."
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
