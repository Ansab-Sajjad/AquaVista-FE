"use client";

import { useMemo, useState } from "react";

import { Box, Card, CardContent, FormControl, MenuItem, Select, Typography, useTheme } from "@mui/material";
import { CurveType, LineChart } from "@mui/x-charts";

import CustomChartTooltip from "@/components/charts/tooltip/custom-chart-tooltip";
import { useGlobalStats } from "@/hooks/use-stats";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";

export default function DashboardFilesChart() {
  const theme = useTheme();
  const { stats } = useGlobalStats();
  const [curve, setCurve] = useState<CurveType>("bumpX");
  const [datePeriod, setDatePeriod] = useState<string>("lastWeek");

  const chartData = useMemo(() => {
    const rawData = stats?.trends.dataFiles ?? [];
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (datePeriod === "lastWeek") {
      const data = rawData.length ? rawData : [0, 0, 0, 0, 0, 0, 0];
      return {
        xAxis: weekdays,
        data: data.length === 7 ? data : [...data, ...Array(7 - data.length).fill(0)],
      };
    }
    if (datePeriod === "lastMonth") {
      const weeks = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      const perWeek = Math.max(1, Math.ceil(rawData.length / 4));
      const chunked: number[] = [];
      for (let i = 0; i < 4; i++) {
        const slice = rawData.slice(i * perWeek, (i + 1) * perWeek);
        chunked.push(slice.reduce((a, b) => a + b, 0));
      }
      return { xAxis: weeks, data: chunked.length ? chunked : [0, 0, 0, 0] };
    }
    if (datePeriod === "lastQuarter") {
      const months = ["January", "February", "March"];
      const perMonth = Math.max(1, Math.ceil(rawData.length / 3));
      const chunked: number[] = [];
      for (let i = 0; i < 3; i++) {
        const slice = rawData.slice(i * perMonth, (i + 1) * perMonth);
        chunked.push(slice.reduce((a, b) => a + b, 0));
      }
      return { xAxis: months, data: chunked.length ? chunked : [0, 0, 0] };
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const perMonth = Math.max(1, Math.ceil(rawData.length / 12));
    const chunked: number[] = [];
    for (let i = 0; i < 12; i++) {
      const slice = rawData.slice(i * perMonth, (i + 1) * perMonth);
      chunked.push(slice.reduce((a, b) => a + b, 0));
    }
    return { xAxis: months, data: chunked };
  }, [datePeriod, stats]);

  return (
    <Box>
      <Box className="mt-2 mb-3 flex flex-wrap justify-between gap-4">
        <Typography variant="h6" component="h6">
          Data Files
        </Typography>

        <Box className="-mt-1.5 flex gap-1">
          <FormControl size="small" variant="standard" className="outlined mb-0 w-34">
            <Select
              value={curve}
              onChange={(e) => setCurve(e.target.value as CurveType)}
              IconComponent={NiChevronDownSmall}
              MenuProps={{ className: "outlined" }}
              slotProps={{
                root: {
                  className: "[&>.MuiInputBase-input]:py-0! rounded-sm!",
                },
              }}
            >
              <MenuItem value="bumpX">Bump X</MenuItem>
              <MenuItem value="bumpY">Bump Y</MenuItem>
              <MenuItem value="catmullRom">Catmull Rom</MenuItem>
              <MenuItem value="linear">Linear</MenuItem>
              <MenuItem value="monotoneX">Monotone X</MenuItem>
              <MenuItem value="monotoneY">Monotone Y</MenuItem>
              <MenuItem value="natural">Natural</MenuItem>
              <MenuItem value="step">Step</MenuItem>
              <MenuItem value="stepAfter">Step After</MenuItem>
              <MenuItem value="stepBefore">Step Before</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" variant="standard" className="outlined mb-0 w-34">
            <Select
              value={datePeriod}
              onChange={(e) => setDatePeriod(e.target.value as string)}
              IconComponent={NiChevronDownSmall}
              MenuProps={{ className: "outlined" }}
              slotProps={{
                root: {
                  className: "[&>.MuiInputBase-input]:py-0! rounded-sm!",
                },
              }}
            >
              <MenuItem value="lastWeek">Last Week</MenuItem>
              <MenuItem value="lastMonth">Last Month</MenuItem>
              <MenuItem value="lastQuarter">Last Quarter</MenuItem>
              <MenuItem value="lastYear">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <LineChart
            xAxis={[{ data: chartData.xAxis, scaleType: "band", disableLine: true, disableTicks: true }]}
            yAxis={[
              {
                disableLine: true,
                disableTicks: true,
                min: Math.min(...chartData.data) - 1,
                max: Math.max(...chartData.data) + 1,
                width: 40,
                valueFormatter: (v: number | null) => {
                  if (typeof v !== "number") return "-";
                  return v.toLocaleString();
                },
              },
            ]}
            series={[{ curve, showMark: false, data: chartData.data, color: theme.palette.secondary.main }]}
            height={300}
            slots={{ tooltip: CustomChartTooltip }}
            grid={{ horizontal: true }}
            margin={{ bottom: 0, left: 0, right: 0 }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
