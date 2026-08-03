"use client";

import dayjs from "dayjs";

import { Box, Card, CardContent, Grid, Typography, useTheme } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";

import useHighlightedSparkline from "@/hooks/use-highlighted-sparkline";
import NiTriangleDown from "@/icons/nexture/ni-triangle-down";
import NiTriangleUp from "@/icons/nexture/ni-triangle-up";

export type StatPlotType = "line" | "bar";

export interface StatConfig {
  key: string;
  label: string;
  value: number | string;
  data: number[];
  plotType?: StatPlotType;
  /** Optional formatter applied to the highlighted value. */
  formatValue?: (value: number) => string;
}

type StatsGridProps = {
  stats: StatConfig[];
  title?: string;
  loading?: boolean;
  error?: string | null;
};

/**
 * Renders a responsive grid of stat cards with sparklines, matching the
 * visual style of the default dashboard's `DashboardDefaultStats` section.
 */
export default function StatsGrid({ stats, title, loading, error }: StatsGridProps) {
  const { palette } = useTheme();

  if (loading) {
    return (
      <Box className="flex flex-col gap-3">
        {title && (
          <Typography variant="h6" component="h6" className="mt-2 mb-1">
            {title}
          </Typography>
        )}
        <Grid container spacing={2.5}>
          {Array.from({ length: stats.length || 4 }).map((_, i) => (
            <Grid key={i} size={{ lg: getColSpan(stats.length), md: 6, xs: 12 }}>
              <Card className="h-44 animate-pulse bg-grey-25" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex flex-col gap-3">
        {title && (
          <Typography variant="h6" component="h6" className="mt-2 mb-1">
            {title}
          </Typography>
        )}
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

  if (!stats.length) return null;

  return (
    <Box className="flex flex-col gap-3">
      {title && (
        <Typography variant="h6" component="h6" className="mt-2 mb-1">
          {title}
        </Typography>
      )}
      <Grid container spacing={2.5}>
        {stats.map((stat) => (
          <Grid key={stat.key} size={{ lg: getColSpan(stats.length), md: 6, xs: 12 }}>
            <StatCard
              stat={stat}
              color={stat.plotType === "bar" ? palette.secondary.main : palette.primary.main}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function getColSpan(count: number) {
  if (count <= 2) return 6;
  if (count === 3) return 4;
  return 3;
}

function StatCard({ stat, color }: { stat: StatConfig; color: string }) {
  const sparkline = useHighlightedSparkline({
    data: stat.data.length ? stat.data : [0, 0],
    plotType: stat.plotType ?? "line",
    color,
  });

  const displayValue =
    sparkline.item.value !== undefined && stat.formatValue
      ? stat.formatValue(sparkline.item.value)
      : stat.value;

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-5">
        <Box className="flex flex-col">
          <Typography variant="body1" className="text-text-secondary-dark text-nowrap">
            {stat.label}
            <Typography variant="body1" component="span" className="text-text-secondary-light">
              {" - "}
              {dayjs()
                .subtract(stat.data.length - sparkline.item.index - 1, "day")
                .format("ddd")}
            </Typography>
          </Typography>
          <Box className="flex flex-row items-center justify-start gap-2 lg:justify-between lg:gap-0">
            <Typography variant="h5" className="text-text-primary">
              {displayValue}
            </Typography>
            <ChangeStatus change={sparkline.item.change} />
          </Box>
        </Box>
        <SparkLineChart {...sparkline.props} />
      </CardContent>
    </Card>
  );
}

const ChangeStatus = ({ change }: { change: number | string }) => {
  const numeric = Number(change);
  return (
    <Box className="flex">
      {numeric < 0 ? (
        <NiTriangleDown size="tiny" className={"text-error"} />
      ) : (
        <NiTriangleUp size="tiny" className="text-success" />
      )}
      <Typography variant="body2" className={numeric < 0 ? "text-error" : "text-success"}>
        {Math.abs(numeric)}%
      </Typography>
    </Box>
  );
};
