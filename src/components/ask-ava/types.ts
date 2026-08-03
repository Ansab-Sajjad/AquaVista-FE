export type AvaMessageType = "narrative" | "table" | "chart";

export interface AvaTableData {
  title?: string;
  columns: string[];
  rows: string[][];
}

export interface AvaChartData {
  chartType: "bar" | "line" | "pie";
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  labels: string[];
  series: { name: string; values: number[] }[];
}

export interface AvaMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: AvaMessageType;
  title?: string;
  tableData?: AvaTableData;
  chartData?: AvaChartData;
  isPinned?: boolean;
}

export interface AvaUsage {
  used: number;
  limit: number;
  remaining: number;
  limitReached: boolean;
}

export interface StartupQuestion {
  _id?: string;
  text: string;
  order: number;
}
