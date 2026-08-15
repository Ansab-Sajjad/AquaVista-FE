"use client";

import dayjs, { Dayjs } from "dayjs";
import { Box } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";

interface DateRangeCalendarProps {
  value: [Dayjs | null, Dayjs | null];
  onChange: (value: [Dayjs | null, Dayjs | null]) => void;
  disableFuture?: boolean;
}

export default function DateRangeCalendar({
  value,
  onChange,
  disableFuture,
}: DateRangeCalendarProps) {
  const [start, end] = value;

  const handleSelect = (date: Dayjs) => {
    if (!start || (start && end)) {
      onChange([date, null]);
    } else if (date.isBefore(start)) {
      onChange([date, start]);
    } else {
      onChange([start, date]);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <DateCalendar
        value={start}
        onChange={(date) => date && handleSelect(date)}
        disableFuture={disableFuture}
        maxDate={end ?? undefined}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      />
      <DateCalendar
        value={end}
        onChange={(date) => date && handleSelect(date)}
        disableFuture={disableFuture}
        minDate={start ?? undefined}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      />
    </Box>
  );
}
