"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Box, Button } from "@mui/material";

import RecentActivity from "@/components/stats/recent-activity";
import { useGlobalStats } from "@/hooks/use-stats";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { DateRangeFilter, isWithinRange } from "@/lib/date-range-filter";

export default function DashboardActivity({ dateRange }: { dateRange?: DateRangeFilter | null }) {
  const { stats } = useGlobalStats();

  const filteredActivity = useMemo(() => {
    const activity = stats?.recentActivity ?? [];
    return dateRange ? activity.filter((item) => isWithinRange(item.createdAt, dateRange)) : activity;
  }, [stats, dateRange]);

  return (
    <Box className="h-full">
      <RecentActivity
        items={filteredActivity}
        emptyMessage="No recent activity across your projects."
        fillHeight
        action={
          <Button
            component={Link}
            href="/recent-activity"
            size="tiny"
            color="grey"
            variant="text"
            startIcon={<NiChevronRightSmall size={"tiny"} className="rtl:rotate-180" />}
          >
            View All
          </Button>
        }
      />
    </Box>
  );
}
