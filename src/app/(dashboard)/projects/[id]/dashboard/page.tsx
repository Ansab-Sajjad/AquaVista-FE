"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Box, Button, Card, CardContent, Chip, CircularProgress, Typography } from "@mui/material";

import AvaChart from "@/components/ask-ava/ava-chart";
import AvaTable from "@/components/ask-ava/ava-table";
import type { AvaChartData, AvaTableData } from "@/components/ask-ava/types";
import { getStoredAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type PinnedItem = {
  id: string;
  type: "narrative" | "table" | "chart";
  title: string;
  sourceQuestion: string;
  createdBy: string;
  createdAt: string;
  content: string;
  tableData?: AvaTableData;
  chartData?: AvaChartData;
};

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

export default function DashboardPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const [pinned, setPinned] = useState<PinnedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getStoredAuthToken();

  useEffect(() => {
    async function fetchPinnedItems() {
      if (!projectId || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load pinned items");
        }

        const data = (await response.json()) as PinnedItem[];
        setPinned(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load pinned items. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPinnedItems();
  }, [projectId, token]);

  const handleUnpin = async (id: string) => {
    if (!projectId || !token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/dashboard/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to unpin item");
      }

      setPinned((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to unpin item. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Box className="bg-background-paper shadow-darker-xs flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center animate-in fade-in zoom-in-95 duration-300">
        <CircularProgress size={32} />
        <Typography variant="h3" component="h2">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="bg-background-paper shadow-darker-xs flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center animate-in fade-in slide-in-from-top-3 duration-300">
        <Typography variant="h3" component="h2" className="text-error">
          Error loading dashboard
        </Typography>
        <Typography variant="body1" className="text-text-secondary max-w-lg">
          {error}
        </Typography>
      </Box>
    );
  }

  if (pinned.length === 0) {
    return (
      <Box className="bg-background-paper shadow-darker-xs flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <Typography variant="h3" component="h2">
          No pinned insights yet
        </Typography>
        <Typography variant="body1" className="text-text-secondary max-w-lg">
          Start a conversation with Ask AVA and pin useful responses, tables, or charts to build this project dashboard.
        </Typography>
        <Button
          variant="contained"
          href={`/projects/${projectId}/ask-ava`}
          className="mt-2 transition-transform duration-200 hover:scale-105"
        >
          Start a chat with Ask AVA
        </Button>
      </Box>
    );
  }

  return (
    <Box className="flex w-full flex-col gap-4">
      <Box className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
        <Typography variant="h4" component="h2">
          Dashboard
        </Typography>
        <Chip
          label={`${pinned.length} pinned ${pinned.length === 1 ? "item" : "items"}`}
          size="small"
          color="primary"
          className="transition-transform duration-200 hover:scale-105"
        />
      </Box>

      <Box className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pinned.map((item, index) => (
          <Card
            key={item.id}
            className={cn(
              "bg-background-paper shadow-darker-xs flex h-full flex-col rounded-3xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4",
              item.type === "table" && "md:col-span-2 xl:col-span-2",
              item.type === "chart" && "md:col-span-2 xl:col-span-2",
            )}
            style={{ animationDuration: "500ms", animationDelay: `${100 + index * 75}ms` }}
          >
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <Box className="flex items-start justify-between gap-2">
                <Box className="flex-1 min-w-0">
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
                  className="transition-transform duration-200 hover:scale-105 flex-shrink-0"
                />
              </Box>

              {item.type === "table" && item.tableData ? (
                <Box className="overflow-hidden rounded-xl">
                  <AvaTable data={item.tableData} />
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

              <Box className="mt-auto flex items-center justify-between pt-3 border-t border-grey-100">
                <Typography variant="caption" className="text-text-secondary truncate flex-1">
                  {item.createdBy} &bull; {formatDate(item.createdAt)}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleUnpin(item.id)}
                  className="transition-transform duration-200 hover:scale-105 flex-shrink-0 ml-2"
                >
                  Unpin
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
