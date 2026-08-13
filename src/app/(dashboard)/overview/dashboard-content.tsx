"use client";

import DashboardActions from "./sections/dashboard-actions";
import DashboardActivity from "./sections/dashboard-activity";
import DashboardBanner from "./sections/dashboard-banner";
import DashboardChatsChart from "./sections/dashboard-chats-chart";
import DashboardFilesChart from "./sections/dashboard-files-chart";
import DashboardProjects from "./sections/dashboard-projects";
import DashboardStats from "./sections/dashboard-stats";
import dayjs from "dayjs";
import Link from "next/link";
import { SyntheticEvent, useState } from "react";

import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Menu,
  MenuItem,
  PopoverVirtualElement,
  Tooltip,
  Typography,
} from "@mui/material";

import DateRangeCalendar from "@/components/base-ui/date-range-calendar";
import NiArrowHistory from "@/icons/nexture/ni-arrow-history";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiCross from "@/icons/nexture/ni-cross";
import NiEnterDown from "@/icons/nexture/ni-enter-down";
import { getStoredAuthUser } from "@/lib/auth";
import {
  DATE_RANGE_OPTIONS,
  DateRangeFilter,
  DateRangeTerm,
  formatDateRange,
  getDateRangeForTerm,
} from "@/lib/date-range-filter";

export default function DashboardContent() {
  const [anchorElCalendarMenu, setAnchorElCalendarMenu] = useState<
    EventTarget | Element | PopoverVirtualElement | null
  >(null);
  const open = Boolean(anchorElCalendarMenu);
  const handleClickCalendarMenu = (event: Event | SyntheticEvent) => {
    setAnchorElCalendarMenu(event.currentTarget);
  };
  const handleCloseCalendarMenu = () => {
    setAnchorElCalendarMenu(null);
  };

  const [selectedTerm, setSelectedTerm] = useState<DateRangeTerm | null>(null);
  const [appliedRange, setAppliedRange] = useState<DateRangeFilter | null>(null);

  // Custom date range picker state
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customRange, setCustomRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  const handleTermOptionClick = (option: DateRangeTerm) => {
    setSelectedTerm(option);
    handleCloseCalendarMenu();

    if (option === "Custom") {
      // Open the custom date range picker dialog
      setCustomRange(appliedRange ? [appliedRange.start, appliedRange.end] : [null, null]);
      setCustomDialogOpen(true);
    } else {
      const range = getDateRangeForTerm(option);
      setAppliedRange(range);
    }
  };

  const handleCustomClose = () => {
    setCustomDialogOpen(false);
  };

  const handleCustomApply = () => {
    if (customRange[0] && customRange[1]) {
      setAppliedRange({
        start: customRange[0].startOf("day"),
        end: customRange[1].endOf("day"),
      });
    }
    setCustomDialogOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedTerm(null);
    setAppliedRange(null);
    handleCloseCalendarMenu();
  };

  const filterLabel = appliedRange
    ? selectedTerm === "Custom"
      ? formatDateRange(appliedRange)
      : selectedTerm
    : "Term";

  const user = getStoredAuthUser();
  const userName = (user?.name as string) || (user?.firstName as string) || (user?.email as string) || "there";
  const firstName = String(userName).split(" ")[0].split("@")[0];

  return (
    <Grid container spacing={5}>
      <Grid container spacing={2.5} className="w-full" size={12}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Welcome {firstName}!
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" href="/overview">
              Home
            </Link>
            <Typography variant="body2">Dashboard</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
          <Tooltip title="Switch to Overview">
            <Button
              className="surface-standard flex-none"
              size="medium"
              color="grey"
              variant="surface"
              component={Link}
              href="/overview?tab=overview"
              startIcon={<NiEnterDown size={"medium"} />}
            >
              Overview
            </Button>
          </Tooltip>
          <Button
            className="surface-standard flex-none"
            size="medium"
            color="grey"
            variant="surface"
            onClick={handleClickCalendarMenu}
            startIcon={<NiArrowHistory size={"medium"} />}
            endIcon={<NiChevronDownSmall size={"small"} className="text-text-secondary" />}
          >
            {filterLabel}
          </Button>
          {appliedRange && (
            <Button
              className="surface-standard flex-none"
              size="medium"
              color="grey"
              variant="surface"
              onClick={handleClearFilter}
              startIcon={<NiCross size={"small"} />}
            >
              Clear
            </Button>
          )}
          <Menu
            anchorEl={anchorElCalendarMenu as Element}
            open={open}
            onClose={handleCloseCalendarMenu}
            className="mt-1"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {DATE_RANGE_OPTIONS.map((option) => {
              return (
                <MenuItem
                  key={option}
                  onClick={() => {
                    handleTermOptionClick(option);
                  }}
                  selected={option === selectedTerm}
                >
                  {option}
                </MenuItem>
              );
            })}
          </Menu>
          <Dialog open={customDialogOpen} onClose={handleCustomClose} maxWidth="md" fullWidth>
            <DialogTitle>Select Date Range</DialogTitle>
            <DialogContent>
              <Box className="flex flex-col items-center gap-3">
                <DateRangeCalendar
                  value={customRange}
                  onChange={(newValue) => setCustomRange(newValue)}
                  disableFuture
                />
                <Typography variant="body2" className="text-text-secondary">
                  {customRange[0] && customRange[1]
                    ? `${customRange[0].format("MMM D, YYYY")} - ${customRange[1].format("MMM D, YYYY")}`
                    : "Select a start and end date"}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button size="small" color="grey" variant="text" onClick={handleCustomClose}>
                Cancel
              </Button>
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={handleCustomApply}
                disabled={!customRange[0] || !customRange[1]}
              >
                Apply
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>

      <Grid container size={12}>
        <Grid size={{ lg: 8, xs: 12 }}>
          <DashboardBanner />
        </Grid>

        <Grid size={{ lg: 4, xs: 12 }}>
          <DashboardActions />
        </Grid>
      </Grid>

      <Grid container size={12} sx={{ alignItems: "stretch" }}>
        <Grid size={{ lg: 8, xs: 12 }}>
          <Grid size={12} className="mb-5">
            <DashboardStats dateRange={appliedRange} />
          </Grid>

          <Grid size={12}>
            <DashboardProjects dateRange={appliedRange} />
          </Grid>
        </Grid>
        <Grid size={{ lg: 4, xs: 12 }} className="flex">
          <DashboardActivity dateRange={appliedRange} />
        </Grid>
      </Grid>

      <Grid container size={12}>
        <Grid size={{ lg: 6, xs: 12 }}>
          <DashboardChatsChart />
        </Grid>
        <Grid size={{ lg: 6, xs: 12 }}>
          <DashboardFilesChart />
        </Grid>
      </Grid>
    </Grid>
  );
}
