"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box, Card, CardContent, Typography } from "@mui/material";

import type { ActivityItem } from "@/hooks/use-stats";
import { cn } from "@/lib/utils";

type RecentActivityProps = {
  items: ActivityItem[];
  title?: string;
  emptyMessage?: string;
  /** Optional node rendered on the trailing side of the title row (e.g. a "View All" button). */
  action?: ReactNode;
  /** When true, the card stretches to fill the available height of its parent. */
  fillHeight?: boolean;
};

const CATEGORY_COLOR: Record<string, "info" | "success" | "warning" | "error"> = {
  file_uploaded: "info",
  file_upload_complete: "success",
  file_upload_failed: "error",
  member_added: "info",
  member_removed: "warning",
  project_created: "info",
};

function timeAgo(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function RecentActivity({
  items,
  title = "Recent Activity",
  emptyMessage = "No recent activity.",
  action,
  fillHeight = false,
}: RecentActivityProps) {
  const router = useRouter();
  return (
    <Box className={cn("flex flex-col", fillHeight && "h-full")}>
      <Box className="mb-3 flex flex-row items-center justify-between gap-2">
        <Typography variant="h6" component="h6" className="mt-2">
          {title}
        </Typography>
        {action}
      </Box>
      <Card className={cn("flex flex-col overflow-hidden", fillHeight && "min-h-0 flex-1")}>
        <CardContent className="flex min-h-0 flex-1 flex-col pe-0! pt-0!">
          {items.length === 0 ? (
            <Box className="flex flex-1 items-center justify-center p-8 text-center">
              <Typography variant="body2" className="text-text-secondary">
                {emptyMessage}
              </Typography>
            </Box>
          ) : (
            <Timeline
              className={cn(
                "items-start overflow-x-hidden overflow-y-auto",
                fillHeight ? "min-h-0 flex-1" : "max-h-96",
              )}
            >
              {items.map((item, index) => (
                <TimelineItem key={item.id ?? index}>
                  <TimelineSeparator>
                    <TimelineDot color={CATEGORY_COLOR[item.category] ?? "info"} variant="outlined" />
                    {index < items.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent
                    className={cn("min-w-0", item.href ? "cursor-pointer" : "")}
                    onClick={() => item.href && router.push(item.href)}
                  >
                    <Typography variant="subtitle2" className="text-text-primary truncate">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" className="text-text-secondary line-clamp-2 break-words">
                      {item.message}
                    </Typography>
                    <Typography variant="body2" className="text-text-disabled">
                      {timeAgo(item.createdAt)}
                      {item.actorName ? ` • ${item.actorName}` : ""}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export { timeAgo };
