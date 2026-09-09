export type ColumnKey =
  | "start" | "finish" | "duration" | "assignee" | "progress" | "status"
  | "phase" | "company" | "predecessor" | "float" | "baselineStart" | "baselineFinish";

export const columnDefs: { key: ColumnKey; label: string; width: number }[] = [
  { key: "start", label: "Start", width: 64 },
  { key: "finish", label: "Finish", width: 64 },
  { key: "duration", label: "Duration", width: 56 },
  { key: "assignee", label: "Assignee", width: 120 },
  { key: "progress", label: "Progress", width: 60 },
  { key: "status", label: "Status", width: 78 },
  { key: "phase", label: "Phase", width: 110 },
  { key: "company", label: "Company", width: 120 },
  { key: "predecessor", label: "Predecessor", width: 130 },
  { key: "float", label: "Float", width: 52 },
  { key: "baselineStart", label: "Baseline Start", width: 84 },
  { key: "baselineFinish", label: "Baseline Finish", width: 88 },
];

export const defaultColumns: ColumnKey[] = ["start", "finish", "duration", "status"];
export const defaultListColumns: ColumnKey[] = ["start", "finish", "duration", "assignee", "progress", "status"];

export type ZoomLevel = "Day" | "Week" | "Month" | "Quarter";
export const zoomPx: Record<ZoomLevel, number> = { Day: 26, Week: 9, Month: 3.4, Quarter: 1.6 };
