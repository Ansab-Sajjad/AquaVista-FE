"use client";

import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";

import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";

interface DateRangeCalendarProps {
  value: [Dayjs | null, Dayjs | null];
  onChange: (value: [Dayjs | null, Dayjs | null]) => void;
  disableFuture?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Build a 6x7 grid of day cells for the month containing `monthDate`. */
function getMonthGrid(monthDate: Dayjs): Dayjs[] {
  const startOfMonth = monthDate.startOf("month");
  const startOfGrid = startOfMonth.subtract(startOfMonth.day(), "day");
  return Array.from({ length: 42 }, (_, i) => startOfGrid.add(i, "day"));
}

function isSameDay(a: Dayjs | null, b: Dayjs | null) {
  return Boolean(a && b && a.isSame(b, "day"));
}

function isInRange(day: Dayjs, start: Dayjs | null, end: Dayjs | null) {
  return Boolean(start && end && (day.isAfter(start, "day") || day.isSame(start, "day")) && (day.isBefore(end, "day") || day.isSame(end, "day")));
}

function isRangeEdge(day: Dayjs, start: Dayjs | null, end: Dayjs | null) {
  return isSameDay(day, start) || isSameDay(day, end);
}

export default function DateRangeCalendar({ value, onChange, disableFuture }: DateRangeCalendarProps) {
  const [start, end] = value;
  const today = dayjs();
  // Left calendar shows the start month (or current month); right shows the next month.
  const [leftMonth, setLeftMonth] = useState<Dayjs>(start ?? today);

  const rightMonth = useMemo(() => leftMonth.add(1, "month"), [leftMonth]);

  const handleSelect = (date: Dayjs) => {
    if (disableFuture && date.isAfter(today, "day")) return;
    if (!start || (start && end)) {
      onChange([date, null]);
    } else if (date.isBefore(start, "day")) {
      onChange([date, start]);
    } else {
      onChange([start, date]);
    }
  };

  const goPrevMonth = () => setLeftMonth((m) => m.subtract(1, "month"));
  const goNextMonth = () => setLeftMonth((m) => m.add(1, "month"));

  const renderMonth = (monthDate: Dayjs) => {
    const days = getMonthGrid(monthDate);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-text-primary text-sm font-semibold capitalize">{monthDate.format("MMMM YYYY")}</span>
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-text-secondary flex h-8 items-center justify-center text-xs font-medium">
              {wd}
            </div>
          ))}
          {days.map((day) => {
            const inMonth = day.isSame(monthDate, "month");
            const isFuture = disableFuture && day.isAfter(today, "day");
            const isStart = isSameDay(day, start);
            const isEnd = isSameDay(day, end);
            const isEdge = isRangeEdge(day, start, end);
            const inRange = isInRange(day, start, end);
            const isToday = day.isSame(today, "day");

            return (
              <button
                key={day.format("YYYY-MM-DD")}
                type="button"
                disabled={isFuture || !inMonth}
                onClick={() => handleSelect(day)}
                className={[
                  "relative flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
                  inMonth ? "text-text-primary" : "text-text-disabled pointer-events-none",
                  isFuture && inMonth ? "text-text-disabled cursor-not-allowed" : "",
                  inRange && !isEdge ? "bg-primary/15 text-text-primary" : "",
                  isEdge ? "bg-primary text-text-contrast font-semibold" : "",
                  !isEdge && !inRange && inMonth ? "hover:bg-grey-50" : "",
                  isToday && !isEdge ? "ring-1 ring-primary" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {day.format("D")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background-paper rounded-2xl border border-grey-50 p-4 shadow-2xs">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="text-text-secondary hover:text-text-primary hover:bg-grey-50 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <NiChevronLeftSmall size="small" />
        </button>
        <button
          type="button"
          onClick={goNextMonth}
          className="text-text-secondary hover:text-text-primary hover:bg-grey-50 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          aria-label="Next month"
        >
          <NiChevronRightSmall size="small" />
        </button>
      </div>
      <div className="flex gap-6">
        {renderMonth(leftMonth)}
        {renderMonth(rightMonth)}
      </div>
    </div>
  );
}
