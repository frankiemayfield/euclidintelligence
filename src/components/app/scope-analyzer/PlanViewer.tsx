import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  FileText,
  Maximize,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  List,
  ListX,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_PLAN_FILE_NAME, MAIN_PLAN_FILE_PATH, type TakeoffRecord } from "@/data/scopeAnalyzerData";
import { FloatingTakeoffToolbar, type TakeoffTool } from "./FloatingTakeoffToolbar";
import { MeasurementHUD } from "./MeasurementHUD";
import { TakeoffCompletionCard } from "./TakeoffCompletionCard";
import { CalibrationDialog } from "./CalibrationDialog";
import { GeometryOverlay } from "./takeoff/GeometryOverlay";
import type { TakeoffShape } from "./takeoff/geometry";
import { useCanvasNavigation } from "./takeoff/useCanvasNavigation";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type { TakeoffTool } from "./FloatingTakeoffToolbar";

export interface TakeoffMarkup {
  takeoffId: string;
  lineItemId: string;
  pageNumber: number;
  tool: TakeoffTool;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TakeoffLineItemOption {
  id: string;
  name: string;
  unit: string;
}

interface TakeoffCreatePayload {
  markup: TakeoffMarkup;
  record: TakeoffRecord;
}

export type ViewerMode = "embedded" | "expanded" | "fullscreen" | "hidden";

interface PlanViewerProps {
  currentPage: number;
  lineItemOptions: TakeoffLineItemOption[];
  markups: TakeoffMarkup[];
  mode: ViewerMode;
  onModeChange: (mode: ViewerMode) => void;
  onCreateTakeoff: (payload: TakeoffCreatePayload) => void;
  onDeleteTakeoff: (takeoffId: string, lineItemId: string) => void;
  onPageChange: (page: number) => void;
  onSelectedLineItemChange: (id: string) => void;
  selectedLineItemId: string;
  takeoffs: TakeoffRecord[];
}

const SHEET_PRESETS = [
  { id: "A1.1", name: "Floor Plan", page: 8 },
  { id: "A2.1", name: "Foundation Plan", page: 3 },
  { id: "A3.1", name: "Front Elevation", page: 12 },
  { id: "A4.1", name: "Roof Plan", page: 10 },
  { id: "A5.1", name: "Door Schedule", page: 14 },
  { id: "A5.2", name: "Window Schedule", page: 15 },
  { id: "S1.1", name: "Structural Foundation", page: 3 },
  { id: "S1.2", name: "Footing Details", page: 4 },
  { id: "S2.1", name: "Floor Framing Plan", page: 6 },
  { id: "S3.1", name: "Roof Framing Plan", page: 7 },
  { id: "C1.1", name: "Site Plan", page: 5 },
  { id: "M1.1", name: "Mechanical Plan", page: 18 },
  { id: "E1.1", name: "Electrical Plan", page: 20 },
  { id: "P1.1", name: "Plumbing Plan", page: 19 },
];

export function PlanViewer({
  currentPage,
  lineItemOptions,
  markups,
  mode,
  onModeChange,
  onCreateTakeoff,
  onDeleteTakeoff,
  onPageChange,
  onSelectedLineItemChange,
  selectedLineItemId,
  takeoffs,
}: PlanViewerProps) {
  const [numPages, setNumPages] = useState(1);
  const [tool, setTool] = useState<TakeoffTool>("select");
  const [zoom, setZoom] = useState(1);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationScale, setCalibrationScale] = useState<string | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [liveMeasurement, setLiveMeasurement] = useState<{
    width: number; height: number; area: number; perimeter: number; length: number; count: number; volume: number;
  } | null>(null);
  const [pendingCompletion, setPendingCompletion] = useState<{
    quantity: number; unit: string; toolType: string; markup: TakeoffMarkup; record: TakeoffRecord;
  } | null>(null);
  const [geoShapes, setGeoShapes] = useState<TakeoffShape[]>([]);

  const handleGeoShapeCreated = (shape: TakeoffShape) => setGeoShapes(prev => [...prev, shape]);
  const handleGeoShapeUpdated = (shape: TakeoffShape) => setGeoShapes(prev => prev.map(s => s.id === shape.id ? shape : s));
  const handleGeoShapeDeleted = (shapeId: string) => setGeoShapes(prev => prev.filter(s => s.id !== shapeId));

  const safePage = clamp(currentPage, 1, numPages || 1);
  const sheet = getSheetForPage(safePage);
  const isExpanded = mode === "expanded";
  const isFullscreen = mode === "fullscreen";
  const [showFsInspector, setShowFsInspector] = useState(true);
  const [showFsLog, setShowFsLog] = useState(true);
  const isEmbedded = mode === "embedded";

  const handleCalibrate = (scale: string) => {
    setCalibrationScale(scale);
    setIsCalibrated(true);
  };

  const handleUndo = () => {
    if (takeoffs.length > 0) {
      const last = takeoffs[takeoffs.length - 1];
      if (last.id.startsWith("tk-manual-")) {
        onDeleteTakeoff(last.id, last.linkedLineItemId);
      }
    }
  };

  const handleCreateTakeoffInternal = (payload: TakeoffCreatePayload) => {
    setPendingCompletion({
      quantity: payload.record.quantity,
      unit: payload.record.unit,
      toolType: payload.record.method,
      markup: payload.markup,
      record: payload.record,
    });
  };

  const handleCompletionSave = (lineItemId: string, _saveMode: "save" | "add" | "replace") => {
    if (!pendingCompletion) return;
    onCreateTakeoff({
      markup: { ...pendingCompletion.markup, lineItemId },
      record: { ...pendingCompletion.record, linkedLineItemId: lineItemId },
    });
    setPendingCompletion(null);
  };

  if (mode === "hidden") return null;

  /* ── EMBEDDED: compact landscape preview in right column ── */
  if (isEmbedded) {
    return (
      <div className="shrink-0 border-b border-border bg-card">
        {/* Minimal page nav anchored inside viewer */}
        <div className="flex items-center justify-center gap-1 px-2 py-1 bg-muted/20">
          <Button variant="ghost" size="icon" className="h-5 w-5" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-[10px] font-semibold text-foreground min-w-[70px] text-center">
            Page {safePage} / {numPages || 1}
          </span>
          <Button variant="ghost" size="icon" className="h-5 w-5" disabled={safePage >= (numPages || 1)} onClick={() => onPageChange(safePage + 1)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
          <div className="w-px h-3 bg-border mx-0.5" />
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onModeChange("expanded")} title="Expand viewer">
            <Maximize2 className="h-2.5 w-2.5" />
          </Button>
        </div>

        {/* Landscape preview — clean, no clutter */}
        <div className="h-[160px] overflow-hidden cursor-pointer" onClick={() => onModeChange("expanded")}>
          <PdfViewport
            compact
            onDocumentLoad={setNumPages}
            pageNumber={safePage}
          />
        </div>
      </div>
    );
  }

  /* ── FULLSCREEN: immersive takeoff workspace ── */
  if (isFullscreen) {
    const selectedOpt = lineItemOptions.find(o => o.id === selectedLineItemId);
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2 shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Full Screen Takeoff</span>
            <span className="text-xs text-muted-foreground">{sheet ? `${sheet.id} — ${sheet.name}` : MAIN_PLAN_FILE_NAME}</span>
          </div>

          {/* Page nav center */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-bold text-foreground min-w-[100px] text-center">
              Page {safePage} / {numPages || 1}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= (numPages || 1)} onClick={() => onPageChange(safePage + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom */}
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={zoom <= 0.5} onClick={() => setZoom(v => Math.max(0.5, round(v - 0.2, 1)))}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={zoom >= 3} onClick={() => setZoom(v => Math.min(3, round(v + 0.2, 1)))}>
              <ZoomIn className="h-3 w-3" />
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Panel toggles */}
            <Button variant={showFsLog ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setShowFsLog(v => !v)} title={showFsLog ? "Hide takeoff log" : "Show takeoff log"}>
              {showFsLog ? <ListX className="h-3 w-3" /> : <List className="h-3 w-3" />}
            </Button>
            <Button variant={showFsInspector ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setShowFsInspector(v => !v)} title={showFsInspector ? "Hide inspector" : "Show inspector"}>
              {showFsInspector ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onModeChange("expanded")} title="Exit full screen">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Target line item strip */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-1.5 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Target</span>
          <Select value={selectedLineItemId} onValueChange={onSelectedLineItemChange}>
            <SelectTrigger className="h-7 max-w-[360px] text-xs">
              <SelectValue placeholder="Select a line item" />
            </SelectTrigger>
            <SelectContent>
              {lineItemOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">{opt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedOpt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">{selectedOpt.unit}</Badge>
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex flex-1 min-h-0 relative">
          {/* Plan viewport - dominant */}
          <div className="flex-1 min-w-0 relative bg-muted/5 overflow-auto">
            <FloatingTakeoffToolbar
              activeTool={tool}
              onToolChange={setTool}
              onUndo={handleUndo}
              onClearCurrent={() => setPendingCompletion(null)}
              onCalibrationClick={() => setShowCalibration(true)}
              isCalibrated={isCalibrated}
              collapsed={toolbarCollapsed}
              onCollapsedChange={setToolbarCollapsed}
              visible
            />

            <MeasurementHUD
              tool={tool}
              isDrawing={isDrawing}
              currentMeasurement={liveMeasurement}
              visible
            />

            {pendingCompletion && (
              <TakeoffCompletionCard
                quantity={pendingCompletion.quantity}
                unit={pendingCompletion.unit}
                toolType={pendingCompletion.toolType}
                linkedLineItemId={selectedLineItemId}
                lineItemOptions={lineItemOptions}
                onSave={handleCompletionSave}
                onCancel={() => setPendingCompletion(null)}
              />
            )}

            <CalibrationDialog
              open={showCalibration}
              onClose={() => setShowCalibration(false)}
              onCalibrate={handleCalibrate}
              currentScale={calibrationScale}
            />

            <div className="p-3 h-full">
              <PdfViewport
                activeTool={tool}
                geoShapes={geoShapes}
                markups={markups}
                onCreateTakeoff={handleCreateTakeoffInternal}
                onDocumentLoad={setNumPages}
                onDrawingChange={setIsDrawing}
                onGeoShapeCreated={handleGeoShapeCreated}
                onGeoShapeUpdated={handleGeoShapeUpdated}
                onGeoShapeDeleted={handleGeoShapeDeleted}
                onLiveMeasurement={setLiveMeasurement}
                onZoomChange={setZoom}
                externalZoom={zoom}
                pageNumber={safePage}
                selectedLineItemId={selectedLineItemId}
              />
            </div>
          </div>

          {/* Right panel: inspector + takeoff log */}
          {(showFsInspector || showFsLog) && (
            <div className="w-[280px] shrink-0 flex flex-col border-l border-border bg-card">
              {/* Takeoff log */}
              {showFsLog && (
                <div className={cn("overflow-y-auto p-3 border-b border-border", showFsInspector ? "max-h-[50%]" : "flex-1")}>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Takeoff Log</h4>
                    <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[9px]">{takeoffs.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {takeoffs.length === 0 ? (
                      <div className="rounded-md border border-dashed border-border px-3 py-4 text-[10px] text-muted-foreground text-center">
                        No takeoffs linked yet
                      </div>
                    ) : takeoffs.map(t => (
                      <TakeoffLogEntry key={t.id} takeoff={t} onDelete={onDeleteTakeoff} />
                    ))}
                  </div>
                </div>
              )}

              {/* Mini inspector */}
              {showFsInspector && (
                <div className="flex-1 overflow-y-auto p-3">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Inspector</h4>
                  {selectedOpt ? (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-foreground">{selectedOpt.name}</div>
                      <div className="text-[10px] text-muted-foreground">Unit: {selectedOpt.unit}</div>
                      <div className="text-[10px] text-muted-foreground">Takeoffs: {takeoffs.length}</div>
                      <div className="text-[10px] text-muted-foreground">Page: {safePage}</div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground">Select a line item to see details.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── EXPANDED: full workspace viewer ── */
  return (
    <div className="flex flex-col border-b border-border bg-card h-[520px] shadow-md transition-all duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 shrink-0">
        <div className="min-w-0 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Main Source Print</span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {sheet ? `${sheet.id} — ${sheet.name}` : MAIN_PLAN_FILE_NAME}
            </div>
          </div>
        </div>

        {/* Centered page nav */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm font-bold text-foreground min-w-[100px] text-center">
            Page {safePage} / {numPages || 1}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= (numPages || 1)} onClick={() => onPageChange(safePage + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Zoom */}
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={zoom <= 0.5} onClick={() => setZoom(v => Math.max(0.5, round(v - 0.2, 1)))}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="w-10 text-center text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={zoom >= 3} onClick={() => setZoom(v => Math.min(3, round(v + 0.2, 1)))}>
            <ZoomIn className="h-3 w-3" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onModeChange("fullscreen")} title="Full screen takeoff">
            <Maximize className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onModeChange("embedded")} title="Minimize viewer">
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onModeChange("hidden")} title="Hide viewer">
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/10 px-3 py-1.5 shrink-0">
        {SHEET_PRESETS.map(s => (
          <button
            key={`${s.id}-${s.page}`}
            type="button"
            onClick={() => onPageChange(s.page)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] whitespace-nowrap transition-colors",
              safePage === s.page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {s.id}
          </button>
        ))}
      </div>

      {/* Main viewport area */}
      <div className="flex flex-1 min-h-0 relative">
        <div className="flex-1 min-w-0 relative bg-muted/5 overflow-auto">
          <FloatingTakeoffToolbar
            activeTool={tool}
            onToolChange={setTool}
            onUndo={handleUndo}
            onClearCurrent={() => setPendingCompletion(null)}
            onCalibrationClick={() => setShowCalibration(true)}
            isCalibrated={isCalibrated}
            collapsed={toolbarCollapsed}
            onCollapsedChange={setToolbarCollapsed}
            visible
          />

          <MeasurementHUD
            tool={tool}
            isDrawing={isDrawing}
            currentMeasurement={liveMeasurement}
            visible
          />

          {pendingCompletion && (
            <TakeoffCompletionCard
              quantity={pendingCompletion.quantity}
              unit={pendingCompletion.unit}
              toolType={pendingCompletion.toolType}
              linkedLineItemId={selectedLineItemId}
              lineItemOptions={lineItemOptions}
              onSave={handleCompletionSave}
              onCancel={() => setPendingCompletion(null)}
            />
          )}

          <CalibrationDialog
            open={showCalibration}
            onClose={() => setShowCalibration(false)}
            onCalibrate={handleCalibrate}
            currentScale={calibrationScale}
          />

          <div className="p-3 h-full">
            <PdfViewport
              activeTool={tool}
              geoShapes={geoShapes}
              markups={markups}
              onCreateTakeoff={handleCreateTakeoffInternal}
              onDocumentLoad={setNumPages}
              onDrawingChange={setIsDrawing}
              onGeoShapeCreated={handleGeoShapeCreated}
              onGeoShapeUpdated={handleGeoShapeUpdated}
              onGeoShapeDeleted={handleGeoShapeDeleted}
              onLiveMeasurement={setLiveMeasurement}
              onZoomChange={setZoom}
              externalZoom={zoom}
              pageNumber={safePage}
              selectedLineItemId={selectedLineItemId}
            />
          </div>
        </div>

        {/* Takeoff sidebar */}
        <div className="w-[280px] shrink-0 flex flex-col border-l border-border bg-background">
          <div className="p-3 border-b border-border space-y-3">
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Target Line Item</div>
              <Select value={selectedLineItemId} onValueChange={onSelectedLineItemChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a line item" />
                </SelectTrigger>
                <SelectContent>
                  {lineItemOptions.map(opt => (
                    <SelectItem key={opt.id} value={opt.id} className="text-xs">{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Takeoff Log</h4>
              <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[9px]">{takeoffs.length}</Badge>
            </div>
            <div className="space-y-1.5">
              {takeoffs.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-4 text-[10px] text-muted-foreground text-center">
                  No takeoffs linked yet
                </div>
              ) : takeoffs.map(t => (
                <TakeoffLogEntry key={t.id} takeoff={t} onDelete={onDeleteTakeoff} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TakeoffLogEntry({ takeoff, onDelete }: { takeoff: TakeoffRecord; onDelete: (id: string, liId: string) => void }) {
  const isManual = takeoff.id.startsWith("tk-manual-");
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-medium text-foreground">{takeoff.quantity} {takeoff.unit}</div>
          <div className="truncate text-[10px] capitalize text-muted-foreground">{takeoff.method} · {takeoff.sourcePage}</div>
          <div className="text-[9px] text-muted-foreground/70">{takeoff.timestamp}</div>
        </div>
        {isManual && (
          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-muted-foreground" onClick={() => onDelete(takeoff.id, takeoff.linkedLineItemId)}>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── PDF Viewport ─── */

interface PdfViewportProps {
  activeTool?: TakeoffTool;
  compact?: boolean;
  geoShapes?: TakeoffShape[];
  markups?: TakeoffMarkup[];
  onCreateTakeoff?: (payload: TakeoffCreatePayload) => void;
  onDocumentLoad?: (numPages: number) => void;
  onDrawingChange?: (drawing: boolean) => void;
  onGeoShapeCreated?: (shape: TakeoffShape) => void;
  onGeoShapeUpdated?: (shape: TakeoffShape) => void;
  onGeoShapeDeleted?: (shapeId: string) => void;
  onLiveMeasurement?: (m: { width: number; height: number; area: number; perimeter: number; length: number; count: number; volume: number } | null) => void;
  onZoomChange?: (zoom: number) => void;
  pageNumber: number;
  selectedLineItemId?: string;
  externalZoom?: number;
  onExternalZoomChange?: (zoom: number) => void;
}

function PdfViewport({
  activeTool = "select",
  compact = false,
  geoShapes = [],
  markups = [],
  onCreateTakeoff,
  onDocumentLoad,
  onDrawingChange,
  onGeoShapeCreated,
  onGeoShapeUpdated,
  onGeoShapeDeleted,
  onLiveMeasurement,
  onZoomChange,
  pageNumber,
  selectedLineItemId,
  externalZoom,
  onExternalZoomChange,
}: PdfViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pageAspectRatio, setPageAspectRatio] = useState(1.35);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const { transform, isPanning, setZoom, resetView, handlers: navHandlers } = useCanvasNavigation(viewportRef);

  // Sync external zoom controls
  useEffect(() => {
    if (externalZoom !== undefined && Math.abs(externalZoom - transform.zoom) > 0.01) {
      setZoom(externalZoom);
    }
  }, [externalZoom]);

  // Report zoom changes back to parent
  useEffect(() => {
    onZoomChange?.(transform.zoom);
    onExternalZoomChange?.(transform.zoom);
  }, [transform.zoom]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const baseWidth = compact ? Math.max(400, containerWidth - 12 || 400) : Math.max(760, containerWidth - 12 || 760);
  const renderWidth = Math.round(baseWidth);
  const renderHeight = Math.max(140, Math.round(renderWidth * pageAspectRatio));

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative w-full bg-background",
        compact ? "h-[140px] overflow-hidden" : "h-full overflow-hidden rounded-lg border border-border",
        isPanning && !compact ? "cursor-grabbing" : "",
      )}
      onMouseDown={compact ? undefined : navHandlers.onMouseDown}
      onMouseMove={compact ? undefined : navHandlers.onMouseMove}
      onMouseUp={compact ? undefined : navHandlers.onMouseUp}
      onMouseLeave={compact ? undefined : navHandlers.onMouseUp}
    >
      <div
        className={cn("mx-auto", compact ? "w-full h-full" : "origin-top-left")}
        style={compact ? undefined : {
          transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.zoom})`,
          transformOrigin: "0 0",
          width: renderWidth,
          minHeight: renderHeight,
        }}
      >
        <Document
          file={MAIN_PLAN_FILE_PATH}
          loading={renderViewerState(compact, "Loading PDF…")}
          error={renderViewerError(compact, documentError)}
          onLoadSuccess={({ numPages: n }) => { setDocumentError(null); onDocumentLoad?.(n); }}
          onLoadError={(err) => setDocumentError(extractPdfErrorMessage(err))}
        >
          <div
            className={cn(
              "relative mx-auto overflow-hidden bg-background shadow-sm",
              compact ? "h-full" : "rounded-md border border-border",
            )}
            style={compact ? undefined : { height: renderHeight, width: renderWidth }}
          >
            <Page
              key={`page-${pageNumber}-${renderWidth}`}
              error={renderViewerError(compact, pageError)}
              loading={renderViewerState(compact, "Rendering page…")}
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              width={compact ? containerWidth || 800 : renderWidth}
              onLoadSuccess={(page: { getViewport: (a: { scale: number }) => { height: number; width: number } }) => {
                setPageError(null);
                const vp = page.getViewport({ scale: 1 });
                setPageAspectRatio(vp.height / vp.width);
              }}
              onLoadError={(err) => setPageError(extractPdfErrorMessage(err))}
            />

            {!compact && onCreateTakeoff && onGeoShapeCreated && onGeoShapeUpdated && onGeoShapeDeleted && !isPanning && (
              <GeometryOverlay
                activeTool={activeTool}
                width={renderWidth}
                height={renderHeight}
                pageNumber={pageNumber}
                selectedLineItemId={selectedLineItemId}
                shapes={geoShapes}
                onShapeCreated={onGeoShapeCreated}
                onShapeUpdated={onGeoShapeUpdated}
                onShapeDeleted={onGeoShapeDeleted}
                onCreateTakeoff={onCreateTakeoff}
                onDrawingChange={onDrawingChange}
                onLiveMeasurement={onLiveMeasurement}
                markups={markups}
              />
            )}
          </div>
        </Document>
      </div>

      {/* Zoom indicator - click to reset */}
      {!compact && (
        <button
          type="button"
          onClick={resetView}
          className="absolute top-2 right-2 z-20 rounded-md bg-card/90 border border-border px-2 py-1 text-[10px] font-mono font-bold text-foreground shadow-sm backdrop-blur-sm hover:bg-muted transition-colors"
          title="Click to reset zoom"
        >
          {Math.round(transform.zoom * 100)}%
        </button>
      )}
    </div>
  );
}

/* ─── Utilities ─── */

function renderViewerState(compact: boolean, label: string) {
  return <div className={cn("flex items-center justify-center text-muted-foreground", compact ? "h-[130px]" : "h-[280px]")}><div className="text-xs font-medium">{label}</div></div>;
}

function renderViewerError(compact: boolean, errorMessage?: string | null) {
  return (
    <div className={cn("flex items-center justify-center px-6 text-center", compact ? "h-[130px]" : "h-[280px]")}>
      <div className="max-w-xs space-y-2">
        <AlertTriangle className="mx-auto h-5 w-5 text-destructive" />
        <div className="text-xs font-semibold text-foreground">PDF source unavailable</div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">{errorMessage || `Could not render ${MAIN_PLAN_FILE_NAME}.`}</p>
      </div>
    </div>
  );
}

function extractPdfErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return `Could not render ${MAIN_PLAN_FILE_NAME}.`;
}

function getSheetForPage(pageNumber: number) {
  return SHEET_PRESETS.find(s => s.page === pageNumber);
}

function clamp(v: number, min: number, max: number) { return Math.min(Math.max(v, min), max); }
function round(v: number, p = 0) { const f = 10 ** p; return Math.round(v * f) / f; }
