import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Crosshair, X, Check, AlertTriangle, ShieldCheck, Ban } from "lucide-react";
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

interface CalibrationDialogProps {
  open: boolean;
  onClose: () => void;
  onCalibrate: (scale: string, method: "preset" | "manual") => void;
  onMarkNotToScale: () => void;
  currentCalibration: PageCalibration;
  pageNumber: number;
}

type Step = "method" | "configure" | "confirm" | "verify";

export function CalibrationDialog({
  open,
  onClose,
  onCalibrate,
  onMarkNotToScale,
  currentCalibration,
  pageNumber,
}: CalibrationDialogProps) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<"preset" | "manual">("preset");
  const [selectedScale, setSelectedScale] = useState(currentCalibration.scale || STANDARD_SCALES[2]);
  const [manualValue, setManualValue] = useState("10");
  const [manualUnit, setManualUnit] = useState("ft");
  const [verifyValue, setVerifyValue] = useState("");
  const [verifyExpected, setVerifyExpected] = useState("");

  if (!open) return null;

  const handleApply = () => {
    const scale = method === "preset" ? selectedScale : `${manualValue} ${manualUnit}`;
    onCalibrate(scale, method);
    setStep("verify");
  };

  const handleVerify = () => {
    onClose();
    setStep("method");
  };

  const handleSkipVerify = () => {
    onClose();
    setStep("method");
  };

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
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { onClose(); setStep("method"); }}>
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
                  onClick={() => { setMethod("manual"); setStep("configure"); }}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted/60 transition-colors"
                >
                  <div className="text-xs font-semibold text-foreground">Known Dimension</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Draw a reference line and enter actual length</div>
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
                <Button size="sm" className="flex-1 h-8 text-[10px]" onClick={handleApply}>Apply Calibration</Button>
              </div>
            </>
          )}

          {step === "configure" && method === "manual" && (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Enter known dimension
              </div>
              <div className="text-[10px] text-muted-foreground">
                Draw a reference line on the plan, then enter the real-world length.
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => setStep("method")}>Back</Button>
                <Button size="sm" className="flex-1 h-8 text-[10px]" onClick={handleApply}>Apply Calibration</Button>
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
