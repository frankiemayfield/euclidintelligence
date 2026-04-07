import { cn } from "@/lib/utils";
import type { TakeoffTool } from "./FloatingTakeoffToolbar";

interface MeasurementHUDProps {
  tool: TakeoffTool;
  isDrawing: boolean;
  currentMeasurement: {
    width: number;
    height: number;
    area: number;
    perimeter: number;
    length: number;
    count: number;
    volume: number;
  } | null;
  visible: boolean;
}

export function MeasurementHUD({ tool, isDrawing, currentMeasurement, visible }: MeasurementHUDProps) {
  if (!visible || !isDrawing || !currentMeasurement || tool === "select" || tool === "pan") return null;

  return (
    <div className="absolute bottom-4 left-4 z-50 rounded-lg border border-primary/30 bg-card/95 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Live Measurement
          </span>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        {tool === "linear" && (
          <>
            <MeasurementRow label="Segment Length" value={currentMeasurement.length} unit="LF" primary />
            <MeasurementRow label="Total Length" value={currentMeasurement.length} unit="LF" />
          </>
        )}

        {(tool === "area" || tool === "rectangle" || tool === "polygon") && (
          <>
            <MeasurementRow label="Area" value={currentMeasurement.area} unit="SF" primary />
            <MeasurementRow label="Perimeter" value={currentMeasurement.perimeter} unit="LF" />
          </>
        )}

        {tool === "count" && (
          <MeasurementRow label="Count" value={currentMeasurement.count} unit="EA" primary />
        )}

        {tool === "volume" && (
          <>
            <MeasurementRow label="Area" value={currentMeasurement.area} unit="SF" />
            <MeasurementRow label="Depth" value={0.33} unit="FT" />
            <MeasurementRow label="Volume" value={currentMeasurement.volume} unit="CY" primary />
          </>
        )}
      </div>
    </div>
  );
}

function MeasurementRow({
  label,
  value,
  unit,
  primary = false,
}: {
  label: string;
  value: number;
  unit: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[9px] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={cn("font-mono tabular-nums", primary ? "text-base font-bold text-foreground" : "text-xs font-medium text-foreground")}>
          {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </span>
        <span className="text-[9px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
