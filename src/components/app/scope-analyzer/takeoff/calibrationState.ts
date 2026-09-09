// Per-page calibration state management

export type CalibrationStatus = "calibrated" | "uncalibrated" | "warning" | "not-to-scale";

export interface PageCalibration {
  status: CalibrationStatus;
  scale: string | null;
  method: "preset" | "manual" | "suggested";
  verified: boolean;
  verificationDelta?: number; // % difference from expected
}

export interface CalibrationStore {
  pages: Record<number, PageCalibration>;
}

export const INITIAL_CALIBRATION_STORE: CalibrationStore = { pages: {} };

export function getPageCalibration(store: CalibrationStore, page: number): PageCalibration {
  return store.pages[page] ?? { status: "uncalibrated", scale: null, method: "preset", verified: false };
}

export function setPageCalibration(
  store: CalibrationStore,
  page: number,
  cal: Partial<PageCalibration>,
): CalibrationStore {
  const existing = getPageCalibration(store, page);
  return { ...store, pages: { ...store.pages, [page]: { ...existing, ...cal } } };
}

export function getCalibrationBadgeColor(status: CalibrationStatus): string {
  switch (status) {
    case "calibrated": return "text-green-600 dark:text-green-400";
    case "uncalibrated": return "text-destructive";
    case "warning": return "text-orange-500 dark:text-orange-400";
    case "not-to-scale": return "text-orange-500 dark:text-orange-400";
  }
}

export function getCalibrationBadgeBg(status: CalibrationStatus): string {
  switch (status) {
    case "calibrated": return "bg-green-500/10 border-green-500/20";
    case "uncalibrated": return "bg-destructive/10 border-destructive/20";
    case "warning": return "bg-orange-500/10 border-orange-500/20";
    case "not-to-scale": return "bg-orange-500/10 border-orange-500/20";
  }
}

export function getCalibrationLabel(cal: PageCalibration): string {
  switch (cal.status) {
    case "calibrated": return cal.scale ? `Calibrated • ${cal.scale}` : "Calibrated";
    case "uncalibrated": return "Uncalibrated";
    case "warning": return "Warning • Verify scale";
    case "not-to-scale": return "Not to scale";
  }
}
