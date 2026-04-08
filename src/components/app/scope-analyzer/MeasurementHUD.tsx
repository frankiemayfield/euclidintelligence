import { Button } from "@/components/ui/button";
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
  linkedLineItemName?: string;
  onFinish?: () => void;
  onCancel?: () => void;
}

export function MeasurementHUD({
  tool,
  isDrawing,
  currentMeasurement,
  visible,
  linkedLineItemName,
  onFinish,
  onCancel,
}: MeasurementHUDProps) {
  if (!visible || !isDrawing || !currentMeasurement || tool === "select" || tool === "pan") return null;

  const sessionLabel =
    tool === "count" ? "Count Session"
    : tool === "linear" ? "Linear Measurement"
    : tool === "volume" ? "Volume Measurement"
    : "Area Measurement";

  return (
    <div className="absolute bottom-4 left-4 z-50 w-[200px] rounded-lg border border-primary/30 bg-card/95 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {sessionLabel}
          </span>
        </div>
        {linkedLineItemName && (
          <div className="text-[9px] text-muted-foreground truncate mt-0.5">
            {linkedLineItemName}
          </div>
        )}
      </div>

      {/* Measurements */}
      <div className="px-3 py-2 space-y-1">
        {tool === "count" && (
          <MeasurementRow label="Count" value={currentMeasurement.count} unit="EA" primary />
        )}

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

        {tool === "volume" && (
          <>
            <MeasurementRow label="Area" value={currentMeasurement.area} unit="SF" />
            <MeasurementRow label="Depth" value={0.33} unit="FT" />
            <MeasurementRow label="Volume" value={currentMeasurement.volume} unit="CY" primary />
          </>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border px-3 py-1.5 flex items-center gap-1.5">
        <Button
          variant="default"
          size="sm"
          className="h-6 text-[10px] flex-1"
          onClick={onFinish}
        >
          {tool === "count" ? "Finish Counting" : "Finish"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] px-2"
          onClick={onCancel}
        >
          Cancel
        </Button>
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
