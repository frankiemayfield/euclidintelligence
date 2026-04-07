import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crosshair, X } from "lucide-react";

const STANDARD_SCALES = [
  '1/8" = 1\'-0"',
  '3/16" = 1\'-0"',
  '1/4" = 1\'-0"',
  '3/8" = 1\'-0"',
  '1/2" = 1\'-0"',
  '3/4" = 1\'-0"',
  '1" = 1\'-0"',
  '1-1/2" = 1\'-0"',
  '3" = 1\'-0"',
];

interface CalibrationDialogProps {
  open: boolean;
  onClose: () => void;
  onCalibrate: (scale: string) => void;
  currentScale: string | null;
}

export function CalibrationDialog({ open, onClose, onCalibrate, currentScale }: CalibrationDialogProps) {
  const [mode, setMode] = useState<"preset" | "manual">("preset");
  const [selectedScale, setSelectedScale] = useState(currentScale || STANDARD_SCALES[2]);
  const [manualValue, setManualValue] = useState("10");
  const [manualUnit, setManualUnit] = useState("ft");

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-[340px] rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Calibrate Scale</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {currentScale && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-700 dark:text-green-400">Current: {currentScale}</span>
            </div>
          )}

          <div className="flex gap-1.5">
            <Button
              variant={mode === "preset" ? "default" : "outline"}
              size="sm"
              className="flex-1 h-8 text-[10px]"
              onClick={() => setMode("preset")}
            >
              Standard Scale
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              size="sm"
              className="flex-1 h-8 text-[10px]"
              onClick={() => setMode("manual")}
            >
              Manual Entry
            </Button>
          </div>

          {mode === "preset" ? (
            <div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Pick Standard Scale
              </div>
              <Select value={selectedScale} onValueChange={setSelectedScale}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_SCALES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Draw a known distance, then enter the real-world length
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  className="h-9 text-xs flex-1"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  placeholder="Length"
                />
                <Select value={manualUnit} onValueChange={setManualUnit}>
                  <SelectTrigger className="h-9 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ft" className="text-xs">ft</SelectItem>
                    <SelectItem value="in" className="text-xs">in</SelectItem>
                    <SelectItem value="m" className="text-xs">m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            className="w-full h-9 text-xs"
            onClick={() => {
              const scale = mode === "preset" ? selectedScale : `${manualValue} ${manualUnit}`;
              onCalibrate(scale);
              onClose();
            }}
          >
            Apply Calibration
          </Button>
        </div>
      </div>
    </div>
  );
}
