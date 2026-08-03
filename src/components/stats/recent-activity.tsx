"use client";

import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box, Card, CardContent, Typography } from "@mui/material";

import type { ActivityItem } from "@/hooks/use-stats";

type RecentActivityProps = {
  items: ActivityItem[];
  title?: string;
  emptyMessage?: string;
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
}: RecentActivityProps) {
  return (
    <Box>
      <Typography variant="h6" component="h6" className="mt-2 mb-3">
        {title}
      </Typography>
      <Card>
        <CardContent className="pe-0! pt-0!">
          {items.length === 0 ? (
            <Box className="flex items-center justify-center p-8 text-center">
              <Typography variant="body2" className="text-text-secondary">
                {emptyMessage}
              </Typography>
            </Box>
          ) : (
            <Timeline className="max-h-96 items-start overflow-auto">
              {items.map((item, index) => (
                <TimelineItem key={item.id ?? index}>
                  <TimelineSeparator>
                    <TimelineDot
                      color={CATEGORY_COLOR[item.category] ?? "info"}
                      variant="outlined"
                    />
                    {index < items.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2" className="text-text-primary">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" className="text-text-secondary line-clamp-2">
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
