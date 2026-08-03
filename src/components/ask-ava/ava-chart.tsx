"use client";

import type { AvaChartData } from "./types";

import { Box, Typography } from "@mui/material";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";

export default function AvaChart({ data }: { data: AvaChartData }) {
  const { chartType, title, xAxisLabel, yAxisLabel, labels, series } = data;

  if (!labels.length || !series.length) {
    return null;
  }

  const height = 320;

  const renderChart = () => {
    if (chartType === "pie") {
      const pieSeries = series[0];
      const pieData = labels.map((label, index) => ({
        id: index,
        label,
        value: pieSeries.values[index] ?? 0,
      }));
      return (
        <PieChart
          series={[{ data: pieData, innerRadius: 30 }]}
          height={height}
          margin={{ top: 16, bottom: 40, left: 16, right: 16 }}
          slotProps={{ legend: { position: { vertical: "bottom" } } }}
        />
      );
    }

    const chartSeries = series.map((s) => ({ data: s.values, label: s.name }));
    const axisConfig = [{ data: labels, label: xAxisLabel, scaleType: "band" as const }];

    if (chartType === "line") {
      return (
        <LineChart
          series={chartSeries}
          xAxis={axisConfig}
          yAxis={[{ label: yAxisLabel }]}
          height={height}
          grid={{ horizontal: true }}
          margin={{ top: 16, bottom: 40, left: 56, right: 16 }}
          slotProps={{ legend: { position: { vertical: "bottom" } } }}
        />
      );
    }

    return (
      <BarChart
        series={chartSeries}
        xAxis={axisConfig}
        yAxis={[{ label: yAxisLabel }]}
        height={height}
        grid={{ horizontal: true }}
        margin={{ top: 16, bottom: 40, left: 56, right: 16 }}
        slotProps={{ legend: { position: { vertical: "bottom" } } }}
      />
    );
  };

  return (
    <Box className="border-divider bg-background-paper mt-3 w-full overflow-hidden rounded-2xl border p-3">
      {title ? (
        <Typography variant="subtitle2" className="text-text-primary mb-2">
          {title}
        </Typography>
      ) : null}
      {renderChart()}
    </Box>
  );
}
