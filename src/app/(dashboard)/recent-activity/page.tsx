"use client";

import Link from "next/link";

import { Box, Breadcrumbs, CircularProgress, Grid, Typography } from "@mui/material";

import RecentActivity from "@/components/stats/recent-activity";
import { useNotifications } from "@/hooks/use-notifications";
import type { ActivityItem } from "@/hooks/use-stats";

export default function RecentActivityPage() {
  const { notifications, loading } = useNotifications();

  const items: ActivityItem[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    category: n.category,
    title: n.title,
    message: n.message,
    href: n.href,
    createdAt: n.createdAt,
    actorName: n.actor?.name ?? null,
  }));

  return (
    <Grid container spacing={5}>
      <Grid size={12} className="mb-5">
        <Typography variant="h1" component="h1" className="mb-0">
          Recent Activity
        </Typography>
        <Breadcrumbs>
          <Link color="inherit" href="/overview">
            Overview
          </Link>
          <Typography variant="body2">Recent Activity</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid size={12}>
        {loading ? (
          <Box className="flex h-96 items-center justify-center">
            <CircularProgress />
          </Box>
        ) : (
          <RecentActivity items={items} title="All Recent Activity" emptyMessage="No recent activity found." />
        )}
      </Grid>
    </Grid>
  );
}
