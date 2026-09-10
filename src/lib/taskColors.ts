// Schedule task colors: default by trade, customizable per trade or per task.
import { useCallback, useSyncExternalStore } from "react";
import type { ScheduleTask } from "@/data/scheduleData";

export const TASK_COLOR_SWATCHES = [
  "#2563eb", "#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16",
  "#eab308", "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#a855f7",
  "#6366f1", "#64748b", "#78716c", "#0f172a",
];

/** Known trade defaults; anything else falls back to a stable hashed swatch. */
const TRADE_DEFAULTS: Record<string, string> = {
  sitework: "#78716c",
  demolition: "#78716c",
  concrete: "#64748b",
  structural: "#2563eb",
  framing: "#2563eb",
  carpentry: "#f59e0b",
  masonry: "#a16207",
  roofing: "#7c3aed",
  mep: "#0ea5e9",
  mechanical: "#06b6d4",
  hvac: "#06b6d4",
  plumbing: "#0ea5e9",
  electrical: "#eab308",
  drywall: "#94a3b8",
  insulation: "#84cc16",
  painting: "#ec4899",
  flooring: "#f97316",
  tile: "#14b8a6",
  finishes: "#22c55e",
  millwork: "#f59e0b",
  landscaping: "#16a34a",
  inspection: "#ef4444",
  milestone: "#0f172a",
  closeout: "#6366f1",
};

const hashSwatch = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TASK_COLOR_SWATCHES[h % TASK_COLOR_SWATCHES.length];
};

export const defaultTradeColor = (trade: string) =>
  TRADE_DEFAULTS[(trade || "").trim().toLowerCase()] ?? hashSwatch(trade || "task");

type ColorState = { trades: Record<string, string>; tasks: Record<string, string> };
const STORAGE_KEY = "euclid-task-colors";

const read = (): ColorState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ColorState>;
      return { trades: parsed.trades ?? {}, tasks: parsed.tasks ?? {} };
    }
  } catch { /* ignore */ }
  return { trades: {}, tasks: {} };
};

let state: ColorState = read();
const listeners = new Set<() => void>();
const emit = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach(l => l());
};
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const snapshot = () => state;

export const setTradeColor = (trade: string, color: string | null) => {
  const trades = { ...state.trades };
  if (color) trades[trade] = color; else delete trades[trade];
  state = { ...state, trades };
  emit();
};
export const setTaskColor = (taskId: string, color: string | null) => {
  const tasks = { ...state.tasks };
  if (color) tasks[taskId] = color; else delete tasks[taskId];
  state = { ...state, tasks };
  emit();
};
export const resetTaskColors = () => { state = { trades: {}, tasks: {} }; emit(); };

export function useTaskColors() {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot);
  const tradeColor = useCallback((trade: string) => s.trades[trade] ?? defaultTradeColor(trade), [s]);
  const colorFor = useCallback(
    (task: Pick<ScheduleTask, "id" | "trade"> & { mapping?: ScheduleTask["mapping"] }) => {
      const trade = task.mapping?.trade || task.trade;
      return s.tasks[task.id] ?? s.trades[trade] ?? defaultTradeColor(trade);
    },
    [s],
  );
  return {
    trades: s.trades,
    tasks: s.tasks,
    tradeColor,
    colorFor,
    isCustomTrade: (trade: string) => !!s.trades[trade],
    isCustomTask: (id: string) => !!s.tasks[id],
    setTradeColor,
    setTaskColor,
    resetTaskColors,
  };
}
