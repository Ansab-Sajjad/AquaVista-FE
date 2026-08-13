import dayjs from "dayjs";

export interface DateRangeFilter {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}

export type DateRangeTerm = "Today" | "7 days" | "30 days" | "Custom";

export const DATE_RANGE_OPTIONS: DateRangeTerm[] = ["Today", "7 days", "30 days", "Custom"];

/**
 * Compute a DateRangeFilter from a preset term.
 * Returns null for "Custom" since it requires user-selected dates.
 */
export function getDateRangeForTerm(term: DateRangeTerm): DateRangeFilter | null {
  const now = dayjs();
  switch (term) {
    case "Today":
      return {
        start: now.startOf("day"),
        end: now.endOf("day"),
      };
    case "7 days":
      return {
        start: now.subtract(6, "day").startOf("day"),
        end: now.endOf("day"),
      };
    case "30 days":
      return {
        start: now.subtract(29, "day").startOf("day"),
        end: now.endOf("day"),
      };
    default:
      return null;
  }
}

/**
 * Check if a date string falls within the given date range (inclusive).
 */
export function isWithinRange(dateString: string | null | undefined, range: DateRangeFilter): boolean {
  if (!dateString) return false;
  const d = dayjs(dateString);
  if (!d.isValid()) return false;
  return (d.isAfter(range.start) || d.isSame(range.start)) && (d.isBefore(range.end) || d.isSame(range.end));
}

/**
 * Format a date range for display.
 */
export function formatDateRange(range: DateRangeFilter): string {
  return `${range.start.format("MMM D, YYYY")} - ${range.end.format("MMM D, YYYY")}`;
}
