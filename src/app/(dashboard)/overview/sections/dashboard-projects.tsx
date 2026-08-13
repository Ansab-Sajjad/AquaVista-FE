"use client";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useMemo } from "react";

import { Box, Button, capitalize, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { getGridDateOperators, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { useGlobalStats } from "@/hooks/use-stats";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { DateRangeFilter, isWithinRange } from "@/lib/date-range-filter";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export default function DashboardProjects({ dateRange }: { dateRange?: DateRangeFilter | null }) {
  const { stats, loading } = useGlobalStats();

  const rows = useMemo(() => {
    const projects = stats?.projects ?? [];
    const filtered = dateRange ? projects.filter((p) => isWithinRange(p.lastUpdated, dateRange)) : projects;
    return filtered.map((project, index) => ({
      id: index + 1,
      projectId: project.id,
      name: project.name,
      municipality: project.municipality,
      members: project.memberCount,
      dataFiles: project.dataFiles,
      createdAt: project.lastUpdated ? dayjs(project.lastUpdated).toDate() : null,
      status: project.dataFiles > 0 ? "Active" : "Pending",
    }));
  }, [stats, dateRange]);

  return (
    <Box>
      <Box className="flex flex-row items-center justify-between">
        <Typography variant="h6" component="h6" className="mt-2 mb-3">
          Recent Projects
        </Typography>
        <Button
          component={Link}
          href="/projects"
          size="tiny"
          color="grey"
          variant="text"
          startIcon={<NiChevronRightSmall size={"tiny"} className="rtl:rotate-180" />}
        >
          View All
        </Button>
      </Box>
      <Card>
        <CardContent>
          <Box className="h-76.5">
            {loading ? (
              <Box className="flex h-full items-center justify-center">
                <CircularProgress size={28} />
              </Box>
            ) : rows.length === 0 ? (
              <Box className="flex h-full items-center justify-center">
                <Typography variant="body2" className="text-text-secondary">
                  No projects yet.
                </Typography>
              </Box>
            ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                hideFooter
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
                columnHeaderHeight={40}
                disableRowSelectionOnClick
                className="border-none"
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Project",
    editable: false,
    width: 200,
    renderCell: (params: GridRenderCellParams<any, string>) => {
      const row = params.row;
      return (
        <Link
          href={`/projects/${row.projectId}/overview`}
          className="text-text-primary link-primary link-underline-none hover:text-primary py-2 font-semibold transition-colors"
        >
          {params.value}
        </Link>
      );
    },
  },
  {
    field: "municipality",
    headerName: "Municipality",
    editable: false,
    width: 160,
  },
  {
    field: "members",
    headerName: "Members",
    type: "number",
    width: 100,
    align: "left",
    editable: false,
    headerAlign: "left",
  },
  {
    field: "dataFiles",
    headerName: "Data Files",
    type: "number",
    width: 110,
    align: "left",
    editable: false,
    headerAlign: "left",
  },
  {
    field: "createdAt",
    headerName: "Updated",
    align: "left",
    headerAlign: "left",
    width: 140,
    type: "dateTime",
    renderCell: (params: GridRenderCellParams<any, Date>) => {
      const value = params.value;
      if (value) {
        const diff = dayjs(value).diff(dayjs());
        return capitalize(dayjs.duration(diff, "milliseconds").humanize(true));
      }
      return <Box></Box>;
    },
    filterOperators: getGridDateOperators(false),
    editable: false,
  },
  {
    field: "status",
    headerName: "Status",
    align: "right",
    headerAlign: "right",
    minWidth: 110,
    flex: 1,
    type: "singleSelect",
    editable: false,
    valueOptions: ["Active", "Pending"],
    renderCell: (params: GridRenderCellParams<any, string>) => {
      const value = params.value;
      if (value === "Active") {
        return (
          <Button className="pointer-events-none self-center" size="tiny" color="success" variant="pastel">
            {value}
          </Button>
        );
      }
      return (
        <Button className="pointer-events-none self-center" size="tiny" color="warning" variant="pastel">
          {value}
        </Button>
      );
    },
  },
];
