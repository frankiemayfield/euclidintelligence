import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Crosshair, X, Check, AlertTriangle, ShieldCheck, Ban, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageCalibration, CalibrationStatus } from "./takeoff/calibrationState";
import { getCalibrationBadgeBg, getCalibrationBadgeColor, getCalibrationLabel } from "./takeoff/calibrationState";

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

export interface CalibrationLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  /** Pixel length (normalized 0-1 coord distance) */
  normalizedLength: number;
}

interface CalibrationDialogProps {
  open: boolean;
  onClose: () => void;
  onCalibrate: (scale: string, method: "preset" | "manual") => void;
  onMarkNotToScale: () => void;
  onEnterCalibrationDraw: () => void;
  currentCalibration: PageCalibration;
  pageNumber: number;
  /** The drawn calibration line, set when user finishes drawing */
  calibrationLine: CalibrationLine | null;
}

type Step = "method" | "configure" | "confirm" | "verify" | "waiting-draw" | "dimension-input";

export function CalibrationDialog({
  open,
  onClose,
  onCalibrate,
  onMarkNotToScale,
  onEnterCalibrationDraw,
  currentCalibration,
  pageNumber,
  calibrationLine,
}: CalibrationDialogProps) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<"preset" | "manual">("preset");
  const [selectedScale, setSelectedScale] = useState(currentCalibration.scale || STANDARD_SCALES[2]);
  const [manualValue, setManualValue] = useState("10");
  const [manualUnit, setManualUnit] = useState("ft");
  const [verifyValue, setVerifyValue] = useState("");
  const [verifyExpected, setVerifyExpected] = useState("");

  // When calibration line arrives from drawing, move to dimension input step
  useEffect(() => {
    if (calibrationLine && step === "waiting-draw") {
      setStep("dimension-input");
    }
  }, [calibrationLine, step]);

  // Reset step when dialog opens
  useEffect(() => {
    if (open) {
      setStep("method");
    }
  }, [open]);

  if (!open && step !== "waiting-draw" && step !== "dimension-input") return null;

  const handleApplyPreset = () => {
    onCalibrate(selectedScale, "preset");
    setStep("verify");
  };

  const handleApplyManual = () => {
    if (!calibrationLine || !manualValue) return;
    // Build a scale string from the drawn line
    const realDim = Number(manualValue);
    if (realDim <= 0) return;
    const scaleLabel = `${realDim} ${manualUnit} (manual)`;
    onCalibrate(scaleLabel, "manual");
    setStep("verify");
  };

  const handleStartDraw = () => {
    setMethod("manual");
    setStep("waiting-draw");
    onEnterCalibrationDraw();
  };

  const handleVerify = () => {
    onClose();
    setStep("method");
  };

  const handleSkipVerify = () => {
    onClose();
    setStep("method");
  };

  const handleCancel = () => {
    onClose();
    setStep("method");
  };

  // During drawing mode, show a floating instruction instead of the full dialog
  if (step === "waiting-draw") {
    return (
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-card/95 shadow-lg backdrop-blur-md px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <div>
            <div className="text-xs font-semibold text-foreground">Calibration Mode</div>
            <div className="text-[10px] text-muted-foreground">Click two points to define a known distance</div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] ml-2" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Dimension input after drawing
  if (step === "dimension-input" && calibrationLine) {
    const pxLen = calibrationLine.normalizedLength;
    return (
      <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="w-[380px] rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Enter Known Dimension</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] text-primary font-medium">Reference line drawn</span>
              </div>
              <div className="text-[9px] text-muted-foreground mt-1">
                Normalized length: {pxLen.toFixed(4)} units
              </div>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              What is the real-world length of this line?
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                className="h-9 text-xs flex-1"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="Length"
                autoFocus
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={handleCancel}>Cancel</Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-[10px]"
                disabled={!manualValue || Number(manualValue) <= 0}
                onClick={handleApplyManual}
              >
                Apply Calibration
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard dialog flow
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-[380px] rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Calibrate Page {pageNumber}
            </h3>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Current status */}
        <div className="px-4 pt-3">
          <div className={cn("flex items-center gap-2 rounded-md border px-3 py-2", getCalibrationBadgeBg(currentCalibration.status))}>
            <StatusIcon status={currentCalibration.status} />
            <span className={cn("text-[10px] font-medium", getCalibrationBadgeColor(currentCalibration.status))}>
              {getCalibrationLabel(currentCalibration)}
            </span>
            {currentCalibration.verified && (
              <Badge variant="outline" className="ml-auto text-[8px] px-1 py-0 text-green-600 border-green-500/30">Verified</Badge>
            )}
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {step === "method" && (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Choose calibration method
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMethod("preset"); setStep("configure"); }}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted/60 transition-colors"
                >
                  <div className="text-xs font-semibold text-foreground">Standard Scale</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Pick from common architectural scales</div>
                </button>
                <button
                  onClick={handleStartDraw}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted/60 transition-colors"
                >
                  <Ruler className="h-4 w-4 text-primary mb-1" />
                  <div className="text-xs font-semibold text-foreground">Known Dimension</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Draw a line on the plan → enter real length</div>
                </button>
              </div>
              <button
                onClick={onMarkNotToScale}
                className="flex items-center gap-2 w-full rounded-md border border-border px-3 py-2 text-[10px] text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <Ban className="h-3 w-3" />
                Mark page as "Not to Scale"
              </button>
            </>
          )}

          {step === "configure" && method === "preset" && (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Select Standard Scale
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => setStep("method")}>Back</Button>
                <Button size="sm" className="flex-1 h-8 text-[10px]" onClick={handleApplyPreset}>Apply Calibration</Button>
              </div>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-[10px] text-green-700 dark:text-green-400 font-medium">Calibration applied successfully</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Verify calibration (optional)
              </div>
              <div className="text-[10px] text-muted-foreground">
                Measure a second known dimension and compare to expected value.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[9px] text-muted-foreground mb-1">Measured</div>
                  <Input type="number" className="h-8 text-xs" value={verifyValue} onChange={(e) => setVerifyValue(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground mb-1">Expected</div>
                  <Input type="number" className="h-8 text-xs" value={verifyExpected} onChange={(e) => setVerifyExpected(e.target.value)} placeholder="0" />
                </div>
              </div>
              {verifyValue && verifyExpected && Number(verifyExpected) > 0 && (
                <div className="rounded-md border border-border px-3 py-2">
                  {(() => {
                    const delta = Math.abs((Number(verifyValue) - Number(verifyExpected)) / Number(verifyExpected) * 100);
                    if (delta < 2) return <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">✓ Verified — {delta.toFixed(1)}% difference</span>;
                    if (delta < 5) return <span className="text-[10px] text-orange-500 font-medium">⚠ Slight mismatch — {delta.toFixed(1)}% difference</span>;
                    return <span className="text-[10px] text-destructive font-medium">✕ Recalibration recommended — {delta.toFixed(1)}% difference</span>;
                  })()}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={handleSkipVerify}>Skip</Button>
                <Button size="sm" className="flex-1 h-8 text-[10px]" onClick={handleVerify}>Confirm</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: CalibrationStatus }) {
  switch (status) {
    case "calibrated": return <ShieldCheck className="h-3 w-3 text-green-500" />;
    case "uncalibrated": return <AlertTriangle className="h-3 w-3 text-destructive" />;
    case "warning": return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    case "not-to-scale": return <Ban className="h-3 w-3 text-orange-500" />;
  }
}

/** Warning dialog when measuring on uncalibrated page */
export function UncalibratedWarning({
  open,
  onCalibrate,
  onContinue,
  onCancel,
}: {
  open: boolean;
  onCalibrate: () => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-[320px] rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-foreground">Page Not Calibrated</h3>
        </div>
        <p className="text-[10px] text-muted-foreground">
          This page is not calibrated. Measurements will be in unscaled mode.
        </p>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-8 text-[10px]" onClick={onCalibrate}>Calibrate Page</Button>
          <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={onContinue}>Continue Unscaled</Button>
        </div>
        <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] text-muted-foreground" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
