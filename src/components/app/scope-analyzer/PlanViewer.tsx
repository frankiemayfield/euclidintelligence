import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Maximize2, Minimize2, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_PLAN_FILE_NAME, MAIN_PLAN_FILE_PATH, type TakeoffRecord } from "@/data/scopeAnalyzerData";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type TakeoffTool = "select" | "linear" | "area" | "count" | "volume" | "rectangle";

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

interface PlanViewerCompactProps {
  currentPage: number;
  onExpand: () => void;
  onPageChange: (page: number) => void;
}

interface PlanViewerExpandedProps {
  currentPage: number;
  lineItemOptions: TakeoffLineItemOption[];
  markups: TakeoffMarkup[];
  onCollapse: () => void;
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

const TAKEOFF_TOOLS: Array<{ id: TakeoffTool; label: string }> = [
  { id: "select", label: "Select" },
  { id: "linear", label: "Linear" },
  { id: "area", label: "Area" },
  { id: "count", label: "Count" },
  { id: "volume", label: "Volume" },
  { id: "rectangle", label: "Rect" },
];

export function PlanViewerCompact({ currentPage, onExpand, onPageChange }: PlanViewerCompactProps) {
  const [numPages, setNumPages] = useState(1);
  const safePage = clamp(currentPage, 1, numPages || 1);
  const sheet = getSheetForPage(safePage);

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <div>
            <div className="text-[10px] font-semibold text-foreground">Main Source Print</div>
            <div className="text-[9px] text-muted-foreground">{sheet?.id ?? "PDF"} · Page {safePage}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExpand} title="Expand PDF viewer">
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>

      <button type="button" className="block w-full p-2 text-left" onClick={onExpand}>
        <PdfViewport compact onDocumentLoad={setNumPages} pageNumber={safePage} />
      </button>

      <div className="flex items-center justify-between px-2 py-1.5 border-t border-border bg-muted/10">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-5 w-5" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
            <ChevronLeft className="h-2.5 w-2.5" />
          </Button>
          <span className="text-[9px] text-muted-foreground">{sheet?.name ?? "Plan set"}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" disabled={safePage >= (numPages || 1)} onClick={() => onPageChange(safePage + 1)}>
            <ChevronRight className="h-2.5 w-2.5" />
          </Button>
        </div>
        <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[9px] font-medium">
          {safePage}/{numPages || 1}
        </Badge>
      </div>
    </div>
  );
}

export function PlanViewerExpanded({
  currentPage,
  lineItemOptions,
  markups,
  onCollapse,
  onCreateTakeoff,
  onDeleteTakeoff,
  onPageChange,
  onSelectedLineItemChange,
  selectedLineItemId,
  takeoffs,
}: PlanViewerExpandedProps) {
  const [numPages, setNumPages] = useState(1);
  const [tool, setTool] = useState<TakeoffTool>("select");
  const [zoom, setZoom] = useState(1);

  const safePage = clamp(currentPage, 1, numPages || 1);
  const sheet = getSheetForPage(safePage);
  const selectedLineItem = lineItemOptions.find(item => item.id === selectedLineItemId);

  return (
    <div className="flex h-[440px] flex-col border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Main Source Print</span>
            <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[9px] font-medium">
              Page {safePage}
            </Badge>
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {sheet ? `${sheet.id} — ${sheet.name}` : `Viewing ${MAIN_PLAN_FILE_NAME}`}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="w-14 text-center text-[10px] text-muted-foreground">{safePage}/{numPages || 1}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= (numPages || 1)} onClick={() => onPageChange(safePage + 1)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={zoom <= 0.8} onClick={() => setZoom(value => Math.max(0.8, round(value - 0.2, 1)))}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="w-12 text-center text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={zoom >= 2.2} onClick={() => setZoom(value => Math.min(2.2, round(value + 0.2, 1)))}>
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCollapse}>
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/10 px-3 py-2">
        {SHEET_PRESETS.map(sheetPreset => (
          <button
            key={`${sheetPreset.id}-${sheetPreset.page}`}
            type="button"
            onClick={() => onPageChange(sheetPreset.page)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] transition-colors",
              safePage === sheetPreset.page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {sheetPreset.id}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex min-w-0 flex-1 flex-col bg-muted/10 p-3">
          <PdfViewport
            activeTool={tool}
            markups={markups}
            onCreateTakeoff={onCreateTakeoff}
            onDocumentLoad={setNumPages}
            pageNumber={safePage}
            selectedLineItemId={selectedLineItemId}
            zoom={zoom}
          />
        </div>

        <div className="flex w-[320px] shrink-0 flex-col border-l border-border bg-background">
          <div className="space-y-3 border-b border-border p-3">
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Target Line Item</div>
              <Select value={selectedLineItemId} onValueChange={onSelectedLineItemChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a line item" />
                </SelectTrigger>
                <SelectContent>
                  {lineItemOptions.map(option => (
                    <SelectItem key={option.id} value={option.id} className="text-xs">
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {selectedLineItem ? `Saving takeoffs to ${selectedLineItem.name}` : "Choose a line item before drawing."}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Takeoff Tools</div>
              <div className="grid grid-cols-3 gap-1.5">
                {TAKEOFF_TOOLS.map(item => (
                  <Button
                    key={item.id}
                    variant={tool === item.id ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => setTool(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/20 px-2.5 py-2 text-[10px] text-muted-foreground">
              Draw directly over the PDF to save a manual takeoff. Linear creates LF, Area/Rect creates SF, Count adds EA, and Volume creates CY.
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Takeoff Log</h4>
              <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[9px] font-medium">
                {takeoffs.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {takeoffs.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-muted/10 px-3 py-4 text-[10px] text-muted-foreground">
                  No takeoffs are linked to the selected line item yet.
                </div>
              ) : (
                takeoffs.map(takeoff => {
                  const isManual = takeoff.id.startsWith("tk-manual-");

                  return (
                    <div key={takeoff.id} className="rounded-md border border-border bg-card px-2.5 py-2 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground">
                            {takeoff.quantity} {takeoff.unit}
                          </div>
                          <div className="truncate text-[10px] capitalize text-muted-foreground">
                            {takeoff.method} · {takeoff.sourcePage}
                          </div>
                          <div className="text-[10px] text-muted-foreground/80">{takeoff.timestamp}</div>
                        </div>
                        {isManual ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-muted-foreground"
                            onClick={() => onDeleteTakeoff(takeoff.id, takeoff.linkedLineItemId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PdfViewportProps {
  activeTool?: TakeoffTool;
  compact?: boolean;
  markups?: TakeoffMarkup[];
  onCreateTakeoff?: (payload: TakeoffCreatePayload) => void;
  onDocumentLoad?: (numPages: number) => void;
  pageNumber: number;
  selectedLineItemId?: string;
  zoom?: number;
}

function PdfViewport({
  activeTool = "select",
  compact = false,
  markups = [],
  onCreateTakeoff,
  onDocumentLoad,
  pageNumber,
  selectedLineItemId,
  zoom = 1,
}: PdfViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pageAspectRatio, setPageAspectRatio] = useState(1.35);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const updateWidth = () => setContainerWidth(element.clientWidth);
    updateWidth();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const baseWidth = compact ? Math.max(220, containerWidth - 12 || 220) : Math.max(760, containerWidth - 12 || 760);
  const renderWidth = Math.round(baseWidth * zoom);
  const renderHeight = Math.max(220, Math.round(renderWidth * pageAspectRatio));

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative w-full rounded-lg border border-border bg-background",
        compact ? "h-[168px] overflow-hidden" : "h-full overflow-auto",
      )}
    >
      <div className={cn("mx-auto py-2", compact ? "w-full" : "min-w-max")}> 
        <Document
          file={MAIN_PLAN_FILE_PATH}
          loading={<ViewerState compact={compact} label="Loading PDF…" />}
          error={<ViewerError compact={compact} />}
          onLoadSuccess={({ numPages }) => onDocumentLoad?.(numPages)}
        >
          <div className="relative mx-auto overflow-hidden rounded-md border border-border bg-background shadow-sm" style={{ height: renderHeight, width: renderWidth }}>
            <Page
              key={`page-${pageNumber}-${renderWidth}`}
              error={<ViewerError compact={compact} />}
              loading={<ViewerState compact={compact} label="Rendering page…" />}
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              width={renderWidth}
              onLoadSuccess={(page: { getViewport: (args: { scale: number }) => { height: number; width: number } }) => {
                const viewport = page.getViewport({ scale: 1 });
                setPageAspectRatio(viewport.height / viewport.width);
              }}
            />

            {!compact && onCreateTakeoff ? (
              <TakeoffOverlay
                activeTool={activeTool}
                height={renderHeight}
                markups={markups.filter(markup => markup.pageNumber === pageNumber)}
                onCreateTakeoff={onCreateTakeoff}
                pageNumber={pageNumber}
                selectedLineItemId={selectedLineItemId}
                width={renderWidth}
              />
            ) : null}
          </div>
        </Document>
      </div>
    </div>
  );
}

interface TakeoffOverlayProps {
  activeTool: TakeoffTool;
  height: number;
  markups: TakeoffMarkup[];
  onCreateTakeoff: (payload: TakeoffCreatePayload) => void;
  pageNumber: number;
  selectedLineItemId?: string;
  width: number;
}

function TakeoffOverlay({ activeTool, height, markups, onCreateTakeoff, pageNumber, selectedLineItemId, width }: TakeoffOverlayProps) {
  const [draft, setDraft] = useState<TakeoffMarkup | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const isDrawingEnabled = activeTool !== "select" && Boolean(selectedLineItemId);

  useEffect(() => {
    setDraft(null);
    setStartPoint(null);
  }, [activeTool, pageNumber, selectedLineItemId]);

  const getRelativePoint = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    return {
      x: clamp(event.clientX - bounds.left, 0, bounds.width),
      y: clamp(event.clientY - bounds.top, 0, bounds.height),
    };
  };

  const commitTakeoff = (tool: TakeoffTool, rect: { height: number; width: number; x: number; y: number }) => {
    if (!selectedLineItemId) return;

    const quantity = getTakeoffQuantity(tool, rect.width / width, rect.height / height);
    const unit = getTakeoffUnit(tool);
    const takeoffId = `tk-manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    onCreateTakeoff({
      markup: {
        takeoffId,
        lineItemId: selectedLineItemId,
        pageNumber,
        tool,
        x: rect.x / width,
        y: rect.y / height,
        width: rect.width / width,
        height: rect.height / height,
      },
      record: {
        id: takeoffId,
        linkedLineItemId: selectedLineItemId,
        method: tool === "rectangle" ? "polygon" : tool as TakeoffRecord["method"],
        notes: `Manual ${tool} takeoff`,
        quantity,
        sourcePage: `Page ${pageNumber}`,
        timestamp: new Date().toLocaleString(),
        unit,
      },
    });
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDrawingEnabled) return;

    const point = getRelativePoint(event);

    if (activeTool === "count") {
      commitTakeoff("count", { height: 18, width: 18, x: point.x - 9, y: point.y - 9 });
      return;
    }

    setStartPoint(point);
    setDraft({
      takeoffId: "draft",
      lineItemId: selectedLineItemId!,
      pageNumber,
      tool: activeTool,
      x: point.x / width,
      y: point.y / height,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!startPoint || !selectedLineItemId) return;

    const point = getRelativePoint(event);
    const rect = normalizeRect(startPoint, point, width, height);

    setDraft({
      takeoffId: "draft",
      lineItemId: selectedLineItemId,
      pageNumber,
      tool: activeTool,
      x: rect.x / width,
      y: rect.y / height,
      width: rect.width / width,
      height: rect.height / height,
    });
  };

  const handleMouseUp = (event: MouseEvent<HTMLDivElement>) => {
    if (!startPoint || !selectedLineItemId) return;

    const point = getRelativePoint(event);
    const rect = normalizeRect(startPoint, point, width, height);

    if (rect.width > 8 || rect.height > 8) {
      commitTakeoff(activeTool, rect);
    }

    setDraft(null);
    setStartPoint(null);
  };

  return (
    <div
      className={cn(
        "absolute inset-0",
        activeTool === "select" ? "pointer-events-none" : "pointer-events-auto",
        isDrawingEnabled ? "cursor-crosshair" : "cursor-not-allowed",
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {markups.map(markup => (
        <TakeoffMarkupShape key={markup.takeoffId} markup={markup} />
      ))}

      {draft ? <TakeoffMarkupShape draft markup={draft} /> : null}

      {activeTool !== "select" && !selectedLineItemId ? (
        <div className="absolute left-4 top-4 rounded-md border border-destructive/20 bg-background/95 px-3 py-2 text-[10px] text-muted-foreground shadow-sm">
          Select a line item in the takeoff panel before drawing on the PDF.
        </div>
      ) : null}
    </div>
  );
}

function TakeoffMarkupShape({ draft = false, markup }: { draft?: boolean; markup: TakeoffMarkup }) {
  const isCount = markup.tool === "count";

  return (
    <div
      className={cn(
        "absolute border border-primary/70 bg-primary/10 shadow-sm",
        isCount ? "rounded-full" : "rounded-sm",
        draft && "border-dashed",
      )}
      style={{
        height: `${Math.max(markup.height * 100, isCount ? 2.2 : 0.8)}%`,
        left: `${markup.x * 100}%`,
        top: `${markup.y * 100}%`,
        width: `${Math.max(markup.width * 100, isCount ? 2.2 : 0.8)}%`,
      }}
    >
      <span className="absolute -top-5 left-0 rounded-sm bg-background px-1 py-0.5 text-[9px] font-medium text-foreground shadow-sm">
        {markup.tool}
      </span>
    </div>
  );
}

function ViewerState({ compact = false, label }: { compact?: boolean; label: string }) {
  return (
    <div className={cn("flex items-center justify-center text-muted-foreground", compact ? "h-[152px]" : "h-[280px]")}> 
      <div className="text-center">
        <div className="text-xs font-medium">{label}</div>
      </div>
    </div>
  );
}

function ViewerError({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center px-6 text-center", compact ? "h-[152px]" : "h-[280px]")}> 
      <div className="max-w-xs space-y-2">
        <AlertTriangle className="mx-auto h-5 w-5 text-destructive" />
        <div className="text-xs font-semibold text-foreground">PDF source unavailable</div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          The current project copy of {MAIN_PLAN_FILE_NAME} is empty or invalid, so the in-app viewer cannot render pages yet.
        </p>
      </div>
    </div>
  );
}

function getSheetForPage(pageNumber: number) {
  return SHEET_PRESETS.find(sheet => sheet.page === pageNumber);
}

function getTakeoffQuantity(tool: TakeoffTool, widthRatio: number, heightRatio: number) {
  switch (tool) {
    case "linear":
      return round(Math.max(widthRatio, heightRatio) * 240, 1);
    case "area":
    case "rectangle":
      return round(widthRatio * heightRatio * 4200, 1);
    case "volume":
      return round(widthRatio * heightRatio * 36, 2);
    case "count":
      return 1;
    default:
      return 0;
  }
}

function getTakeoffUnit(tool: TakeoffTool) {
  switch (tool) {
    case "linear":
      return "LF";
    case "area":
    case "rectangle":
      return "SF";
    case "volume":
      return "CY";
    case "count":
      return "EA";
    default:
      return "LS";
  }
}

function normalizeRect(start: { x: number; y: number }, end: { x: number; y: number }, maxWidth: number, maxHeight: number) {
  const x = clamp(Math.min(start.x, end.x), 0, maxWidth);
  const y = clamp(Math.min(start.y, end.y), 0, maxHeight);
  const width = clamp(Math.abs(end.x - start.x), 0, maxWidth);
  const height = clamp(Math.abs(end.y - start.y), 0, maxHeight);

  return { x, y, width, height };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, precision = 0) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
