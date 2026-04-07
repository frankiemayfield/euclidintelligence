import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const PDF_URL = "/plans/FinalConstructionSetFregolle.pdf";

const MOCK_SHEETS = [
  { id: "A1.1", name: "Floor Plan", page: 1 },
  { id: "A2.1", name: "Foundation Plan", page: 2 },
  { id: "A3.1", name: "Front Elevation", page: 3 },
  { id: "A4.1", name: "Roof Plan", page: 4 },
  { id: "A5.1", name: "Door Schedule", page: 5 },
  { id: "A5.2", name: "Window Schedule", page: 6 },
  { id: "S1.1", name: "Structural Foundation", page: 7 },
  { id: "S1.2", name: "Footing Details", page: 8 },
  { id: "S2.1", name: "Floor Framing Plan", page: 9 },
  { id: "S3.1", name: "Roof Framing Plan", page: 10 },
  { id: "C1.1", name: "Site Plan", page: 11 },
  { id: "M1.1", name: "Mechanical Plan", page: 12 },
  { id: "E1.1", name: "Electrical Plan", page: 13 },
  { id: "P1.1", name: "Plumbing Plan", page: 14 },
];

interface PlanViewerCompactProps {
  onExpand: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

/** Compact PDF thumbnail shown at top of inspector */
export function PlanViewerCompact({ onExpand, currentPage, onPageChange }: PlanViewerCompactProps) {
  const sheet = MOCK_SHEETS.find(s => s.page === currentPage) || MOCK_SHEETS[0];
  const sheetIndex = MOCK_SHEETS.findIndex(s => s.page === currentPage);

  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold text-foreground">Plan Viewer</span>
        </div>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onExpand} title="Expand Plan Viewer">
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>
      {/* PDF preview area */}
      <div className="relative h-[160px] bg-muted/10 cursor-pointer group" onClick={onExpand}>
        <iframe
          src={`${PDF_URL}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-0 pointer-events-none"
          title="Plan Preview"
        />
        <div className="absolute inset-0 bg-transparent group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-[10px] bg-background/90 px-2 py-1 rounded text-foreground font-medium">Click to expand</span>
        </div>
      </div>
      {/* Mini controls */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted/20">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => sheetIndex > 0 && onPageChange(MOCK_SHEETS[sheetIndex - 1].page)}>
            <ChevronLeft className="h-2.5 w-2.5" />
          </Button>
          <span className="text-[9px] text-muted-foreground">{sheet.id} · p.{currentPage}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => sheetIndex < MOCK_SHEETS.length - 1 && onPageChange(MOCK_SHEETS[sheetIndex + 1].page)}>
            <ChevronRight className="h-2.5 w-2.5" />
          </Button>
        </div>
        <span className="text-[9px] text-muted-foreground">{sheetIndex + 1}/{MOCK_SHEETS.length}</span>
      </div>
    </div>
  );
}

interface PlanViewerExpandedProps {
  onCollapse: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

/** Expanded landscape PDF viewer that sits above the workspace */
export function PlanViewerExpanded({ onCollapse, currentPage, onPageChange }: PlanViewerExpandedProps) {
  const [zoom, setZoom] = useState(100);
  const [activeSheet, setActiveSheet] = useState(
    MOCK_SHEETS.find(s => s.page === currentPage)?.id || MOCK_SHEETS[0].id
  );
  const sheet = MOCK_SHEETS.find(s => s.id === activeSheet) || MOCK_SHEETS[0];
  const sheetIndex = MOCK_SHEETS.findIndex(s => s.id === activeSheet);

  const handleSheetChange = (id: string) => {
    setActiveSheet(id);
    const s = MOCK_SHEETS.find(sh => sh.id === id);
    if (s) onPageChange(s.page);
  };

  const handleNav = (dir: -1 | 1) => {
    const next = sheetIndex + dir;
    if (next >= 0 && next < MOCK_SHEETS.length) {
      handleSheetChange(MOCK_SHEETS[next].id);
    }
  };

  return (
    <div className="border-b border-border bg-card flex flex-col" style={{ height: "320px" }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Plan Viewer</span>
          <span className="text-[10px] text-muted-foreground">— {sheet.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Sheet tabs */}
          <div className="flex items-center gap-0.5 mr-2 overflow-x-auto max-w-[400px]">
            {MOCK_SHEETS.map(s => (
              <button key={s.id} onClick={() => handleSheetChange(s.id)}
                className={cn("text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap transition-colors",
                  activeSheet === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {s.id}
              </button>
            ))}
          </div>
          {/* Nav */}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleNav(-1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-[10px] text-muted-foreground">{sheetIndex + 1}/{MOCK_SHEETS.length}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleNav(1)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
          {/* Zoom */}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.max(50, zoom - 10))}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-[10px] text-muted-foreground w-8 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.min(200, zoom + 10))}>
            <ZoomIn className="h-3 w-3" />
          </Button>
          {/* Collapse */}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCollapse} title="Collapse">
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {/* PDF iframe */}
      <div className="flex-1 min-h-0 bg-muted/10">
        <iframe
          src={`${PDF_URL}#page=${sheet.page}&toolbar=0&navpanes=0`}
          className="w-full h-full border-0"
          title="Plan Viewer"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
        />
      </div>
    </div>
  );
}
