import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, Search, PanelRightClose, PanelRightOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  currentSheet?: string;
}

const MOCK_SHEETS = [
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

export function PlanViewer({ isOpen, onToggle, currentSheet }: Props) {
  const [zoom, setZoom] = useState(100);
  const [activeSheet, setActiveSheet] = useState(currentSheet || "A1.1");
  const sheet = MOCK_SHEETS.find(s => s.id === activeSheet) || MOCK_SHEETS[0];
  const sheetIndex = MOCK_SHEETS.findIndex(s => s.id === activeSheet);

  if (!isOpen) {
    return (
      <div className="w-10 border-l border-border bg-card flex flex-col items-center py-3 gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
          <PanelRightOpen className="h-3.5 w-3.5" />
        </Button>
        <div className="writing-mode-vertical text-[10px] text-muted-foreground rotate-180 mt-2" style={{ writingMode: "vertical-rl" }}>
          Plan Viewer
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Plan Viewer</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
          <PanelRightClose className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Sheet selector */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto">
        {MOCK_SHEETS.slice(0, 6).map(s => (
          <button key={s.id} onClick={() => setActiveSheet(s.id)}
            className={cn("text-[10px] px-2 py-1 rounded whitespace-nowrap transition-colors",
              activeSheet === s.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
            {s.id}
          </button>
        ))}
        <span className="text-[10px] text-muted-foreground">+{MOCK_SHEETS.length - 6}</span>
      </div>

      {/* Viewer area */}
      <div className="flex-1 relative bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-muted-foreground/20 font-bold mb-2">{sheet.id}</div>
          <div className="text-xs text-muted-foreground">{sheet.name}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Page {sheet.page}</div>
          <div className="text-[10px] text-muted-foreground/50 mt-4">Plan preview area</div>
          <div className="text-[10px] text-muted-foreground/50">Upload plans to enable viewing</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => sheetIndex > 0 && setActiveSheet(MOCK_SHEETS[sheetIndex - 1].id)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-[10px] text-muted-foreground">{sheetIndex + 1} / {MOCK_SHEETS.length}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => sheetIndex < MOCK_SHEETS.length - 1 && setActiveSheet(MOCK_SHEETS[sheetIndex + 1].id)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.max(50, zoom - 10))}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-[10px] text-muted-foreground">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.min(200, zoom + 10))}>
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
