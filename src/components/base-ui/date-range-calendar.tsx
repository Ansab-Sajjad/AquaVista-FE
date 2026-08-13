"use client";

import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";

import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type DateRange = [Dayjs | null, Dayjs | null];

type MonthGrid = {
  date: Dayjs;
  inCurrentMonth: boolean;
}[];

function buildMonthGrid(month: Dayjs): MonthGrid {
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const startOfGrid = startOfMonth.startOf("week");
  const endOfGrid = endOfMonth.endOf("week");

  const days: MonthGrid = [];
  let cursor = startOfGrid;
  while (cursor.isBefore(endOfGrid) || cursor.isSame(endOfGrid, "day")) {
    days.push({
      date: cursor,
      inCurrentMonth: cursor.month() === month.month(),
    });
    cursor = cursor.add(1, "day");
  }
  return days;
}

type MonthViewProps = {
  month: Dayjs;
  range: DateRange;
  hoverDate: Dayjs | null;
  onDateClick: (date: Dayjs) => void;
  onDateHover: (date: Dayjs | null) => void;
  disableFuture?: boolean;
};

function MonthView({ month, range, hoverDate, onDateClick, onDateHover, disableFuture }: MonthViewProps) {
  const days = useMemo(() => buildMonthGrid(month), [month]);
  const today = dayjs().startOf("day");
  const [start, end] = range;

  const isInRange = (date: Dayjs) => {
    if (start && end) {
      return date.isAfter(start, "day") && date.isBefore(end, "day");
    }
    return false;
  };

  const isHoverRange = (date: Dayjs) => {
    if (start && !end && hoverDate) {
      return date.isAfter(start, "day") && date.isBefore(hoverDate, "day");
    }
    return false;
  };

  const isStart = (date: Dayjs) => Boolean(start && date.isSame(start, "day"));
  const isEnd = (date: Dayjs) => Boolean(end && date.isSame(end, "day"));

  return (
    <div className="flex flex-col gap-2">
      <div className="text-text-primary text-center text-sm font-semibold">
        {MONTHS[month.month()]} {month.year()}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-text-secondary text-[0.7rem] font-medium">
            {wd}
          </div>
        ))}
        {days.map((day, idx) => {
          const isFuture = disableFuture && day.date.isAfter(today, "day");
          const disabled = !day.inCurrentMonth || isFuture;
          const selected = isStart(day.date) || isEnd(day.date);
          const inRange = isInRange(day.date) || isHoverRange(day.date);

          return (
            <div key={idx} className="relative flex items-center justify-center py-0.5">
              {inRange && <span className="bg-primary/15 absolute inset-x-0 inset-y-0.5 rounded-full" />}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onDateClick(day.date)}
                onMouseEnter={() => !disabled && onDateHover(day.date)}
                onMouseLeave={() => onDateHover(null)}
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors",
                  !day.inCurrentMonth && "text-text-disabled opacity-40",
                  day.inCurrentMonth && !selected && !inRange && "text-text-primary hover:bg-primary/10",
                  selected && "bg-primary text-text-contrast font-semibold",
                  isFuture && "text-text-disabled cursor-not-allowed",
                )}
              >
                {day.date.date()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type DateRangeCalendarProps = {
  value: DateRange;
  onChange: (value: DateRange) => void;
  disableFuture?: boolean;
};

export default function DateRangeCalendar({ value, onChange, disableFuture = true }: DateRangeCalendarProps) {
  const [leftMonth, setLeftMonth] = useState<Dayjs>(() => (value[0] ?? dayjs()).startOf("month"));
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);

  const rightMonth = useMemo(() => leftMonth.add(1, "month"), [leftMonth]);

  const goPrevMonth = () => setLeftMonth((m) => m.subtract(1, "month"));
  const goNextMonth = () => setLeftMonth((m) => m.add(1, "month"));

  const handleDateClick = (date: Dayjs) => {
    const [start, end] = value;
    // If no start, or both start and end are set, begin a new selection
    if (!start || (start && end)) {
      onChange([date, null]);
      return;
    }
    // If we have a start but no end
    if (start && !end) {
      if (date.isBefore(start, "day") || date.isSame(start, "day")) {
        // Clicked before/on start — reset to new start
        onChange([date, null]);
      } else {
        onChange([start, date]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="text-text-secondary hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full"
          aria-label="Previous month"
        >
          <NiChevronLeftSmall size="small" />
        </button>
        <button
          type="button"
          onClick={goNextMonth}
          className="text-text-secondary hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full"
          aria-label="Next month"
        >
          <NiChevronRightSmall size="small" />
        </button>
      </div>
      <div className="flex gap-6">
        <MonthView
          month={leftMonth}
          range={value}
          hoverDate={hoverDate}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
          disableFuture={disableFuture}
        />
        <MonthView
          month={rightMonth}
          range={value}
          hoverDate={hoverDate}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
          disableFuture={disableFuture}
        />
      </div>
    </div>
  );
}
