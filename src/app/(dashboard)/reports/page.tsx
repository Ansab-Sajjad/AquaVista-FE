"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PushPinOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import AvaChart from "@/components/ask-ava/ava-chart";
import AvaTable from "@/components/ask-ava/ava-table";
import type { AvaTableData } from "@/components/ask-ava/types";
import { usePinnedInsights, type PinnedInsight } from "@/hooks/use-pinned-insights";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  narrative: "Narrative",
  table: "Table",
  chart: "Basic Chart",
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function normalizeTableData(value: AvaTableData | AvaTableData[] | undefined): AvaTableData[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((entry) => entry && (Array.isArray(entry.columns) || Array.isArray(entry.rows)));
  }
  return [value];
}

export default function ReportsPage() {
  const { insights, loading, error } = usePinnedInsights();
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const insight of insights) {
      if (!map.has(insight.projectId)) {
        map.set(insight.projectId, insight.projectName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [insights]);

  const filtered = useMemo(() => {
    if (projectFilter === "all") return insights;
    return insights.filter((item) => item.projectId === projectFilter);
  }, [insights, projectFilter]);

  if (loading) {
    return (
      <Grid container spacing={5}>
        <Grid size={12} className="mb-5">
          <Typography variant="h1" component="h1" className="mb-0">
            Reports
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" href="/overview">
              Overview
            </Link>
            <Typography variant="body2">Reports</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid size={12}>
          <Box className="bg-background-paper shadow-darker-xs flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center animate-in fade-in zoom-in-95 duration-300">
            <CircularProgress size={32} />
            <Typography variant="h3" component="h2">
              Loading pinned insights...
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container spacing={5}>
        <Grid size={12} className="mb-5">
          <Typography variant="h1" component="h1" className="mb-0">
            Reports
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" href="/overview">
              Overview
            </Link>
            <Typography variant="body2">Reports</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid size={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={5}>
      <Grid size={12} className="mb-5">
        <Typography variant="h1" component="h1" className="mb-0">
          Reports
        </Typography>
        <Breadcrumbs>
          <Link color="inherit" href="/overview">
            Overview
          </Link>
          <Typography variant="body2">Reports</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid size={12}>
        <Box className="flex flex-col gap-4">
          <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Box className="flex items-center gap-2">
              <Typography variant="h6" component="h2">
                Pinned Insights
              </Typography>
              <Chip
                label={`${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
                size="small"
                color="primary"
                className="transition-transform duration-200 hover:scale-105"
              />
            </Box>

            {projects.length > 1 && (
              <Box className="flex flex-wrap gap-1.5">
                <Chip
                  label="All Projects"
                  size="small"
                  color={projectFilter === "all" ? "primary" : "default"}
                  variant={projectFilter === "all" ? "filled" : "outlined"}
                  clickable
                  onClick={() => setProjectFilter("all")}
                  className="transition-transform duration-200 hover:scale-105"
                />
                {projects.map((project) => (
                  <Chip
                    key={project.id}
                    label={project.name}
                    size="small"
                    color={projectFilter === project.id ? "primary" : "default"}
                    variant={projectFilter === project.id ? "filled" : "outlined"}
                    clickable
                    onClick={() => setProjectFilter(project.id)}
                    className="transition-transform duration-200 hover:scale-105"
                  />
                ))}
              </Box>
            )}
          </Box>

          {filtered.length === 0 ? (
            <Box className="bg-background-paper shadow-darker-xs flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <PushPinOutlined sx={{ fontSize: 48 }} className="text-text-disabled" />
              <Typography variant="h4" component="h3">
                No pinned insights yet
              </Typography>
              <Typography variant="body1" className="text-text-secondary max-w-lg">
                Pinned insights from Ask AVA conversations across all your projects will appear here. Open a project and
                pin useful responses, tables, or charts to build your reports.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                href="/projects"
                className="mt-2 transition-transform duration-200 hover:scale-105"
              >
                Browse Projects
              </Button>
            </Box>
          ) : (
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item, index) => (
                <PinnedInsightCard key={item.id} item={item} index={index} />
              ))}
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

function PinnedInsightCard({ item, index }: { item: PinnedInsight; index: number }) {
  return (
    <Card
      className={cn(
        "bg-background-paper shadow-darker-xs flex h-full flex-col rounded-3xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4",
        item.type === "table" && "md:col-span-2 xl:col-span-2",
        item.type === "chart" && "md:col-span-2 xl:col-span-2",
      )}
      style={{ animationDuration: "500ms", animationDelay: `${100 + index * 75}ms` }}
    >
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <Box className="flex items-start justify-between gap-2">
          <Box className="min-w-0 flex-1">
            <Typography variant="h6" component="h3" className="text-text-primary truncate">
              {item.title}
            </Typography>
            <Typography variant="caption" className="text-text-secondary line-clamp-1">
              {TYPE_LABELS[item.type]} &bull; {item.sourceQuestion}
            </Typography>
          </Box>
          <Chip
            label={TYPE_LABELS[item.type]}
            size="small"
            color="primary"
            variant="outlined"
            className="flex-shrink-0 transition-transform duration-200 hover:scale-105"
          />
        </Box>

        {item.type === "table" && normalizeTableData(item.tableData).length > 0 ? (
          <Box className="flex flex-col gap-2 overflow-hidden rounded-xl">
            {normalizeTableData(item.tableData).map((table, tableIndex) => (
              <AvaTable key={tableIndex} data={table} />
            ))}
          </Box>
        ) : item.type === "chart" && item.chartData ? (
          <Box className="overflow-hidden rounded-xl">
            <AvaChart data={item.chartData} />
          </Box>
        ) : (
          <Box className="bg-grey-25 rounded-2xl p-4 transition-colors duration-200 hover:bg-grey-50">
            <Typography variant="body2" className="text-text-primary whitespace-pre-wrap">
              {item.content}
            </Typography>
          </Box>
        )}

        <Box className="mt-auto flex items-center justify-between border-t border-grey-100 pt-3">
          <Box className="flex min-w-0 flex-1 items-center gap-2">
            <Typography variant="caption" className="text-text-secondary truncate">
              {item.createdBy} &bull; {formatDate(item.createdAt)}
            </Typography>
            {item.scope === "global" ? (
              <Chip
                label="Everyone"
                size="small"
                color="primary"
                variant="outlined"
                className="flex-shrink-0"
                title="Pinned by an admin — visible to all project members"
              />
            ) : item.scope === "private" ? (
              <Chip
                label="Only you"
                size="small"
                variant="outlined"
                className="flex-shrink-0"
                title="Pinned by you — visible only to you"
              />
            ) : null}
          </Box>
        </Box>

        <Box className="flex items-center justify-between border-t border-grey-100 pt-2">
          <Link
            href={`/projects/${item.projectId}/dashboard`}
            className="text-primary text-xs font-medium no-underline transition-colors hover:underline"
          >
            {item.projectName}
          </Link>
          <Chip label={item.projectMunicipality} size="small" color="primary" className="flex-shrink-0" />
        </Box>
      </CardContent>
    </Card>
  );
}
