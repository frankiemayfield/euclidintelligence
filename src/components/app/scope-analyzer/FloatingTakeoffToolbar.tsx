import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MousePointer2,
  Ruler,
  Pentagon,
  Circle,
  Square,
  Crosshair,
  Undo2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TakeoffTool = "select" | "linear" | "area" | "count" | "rectangle";

interface FloatingTakeoffToolbarProps {
  activeTool: TakeoffTool;
  onToolChange: (tool: TakeoffTool) => void;
  onUndo: () => void;
  onClearCurrent: () => void;
  onCalibrationClick: () => void;
  isCalibrated: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  visible: boolean;
}

const GEOMETRY_TOOLS = [
  { id: "select" as const, label: "Select / Edit", icon: MousePointer2, shortcut: "V", hint: "Select, move, and edit shapes" },
  { id: "linear" as const, label: "Linear (Polyline)", icon: Ruler, shortcut: "L", hint: "Click points to draw a polyline · Double-click to finish" },
  { id: "area" as const, label: "Area (Polygon)", icon: Pentagon, shortcut: "A", hint: "Click vertices to draw a polygon · Close to finish" },
  { id: "count" as const, label: "Count", icon: Circle, shortcut: "C", hint: "Click to place count markers" },
  { id: "rectangle" as const, label: "Rectangle", icon: Square, shortcut: "R", hint: "Click + drag to draw a rectangle" },
];

export function FloatingTakeoffToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onClearCurrent,
  onCalibrationClick,
  isCalibrated,
  collapsed,
  onCollapsedChange,
  visible,
}: FloatingTakeoffToolbarProps) {
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [idle, setIdle] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!visible) return;
    resetIdleTimer();
    return () => clearTimeout(idleTimer.current);
  }, [visible, activeTool]);

  const resetIdleTimer = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 4000);
  };

  const handleDragStart = (e: MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };

    const onMove = (ev: globalThis.MouseEvent) => {
      setPosition({ x: ev.clientX - dragOffset.current.x, y: ev.clientY - dragOffset.current.y });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!visible) return null;

  const isDrawingTool = activeTool !== "select";
  const activeDef = GEOMETRY_TOOLS.find(t => t.id === activeTool);

  return (
    <div
      className={cn(
        "absolute z-50 flex flex-col rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-md transition-all duration-200",
        idle && !dragging && "opacity-40 hover:opacity-100",
        dragging && "shadow-xl scale-[1.02]",
      )}
      style={{ left: position.x, top: position.y }}
      onMouseEnter={resetIdleTimer}
      onMouseMove={resetIdleTimer}
    >
      {/* Drag handle */}
      <div
        className="flex cursor-grab items-center justify-center border-b border-border px-1 py-1.5 active:cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {collapsed ? (
        <div className="p-1">
          <ToolbarIconButton
            active={false}
            icon={<ChevronRight className="h-3.5 w-3.5" />}
            label="Expand toolbar"
            onClick={() => onCollapsedChange(false)}
          />
        </div>
      ) : (
        <div className="p-1.5 space-y-1.5">
          {/* Geometry tools */}
          <div>
            <div className="px-1 pb-1 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
              Geometry
            </div>
            <div className="space-y-0.5">
              {GEOMETRY_TOOLS.map((tool) => (
                <ToolbarIconButton
                  key={tool.id}
                  active={activeTool === tool.id}
                  icon={<tool.icon className="h-3.5 w-3.5" />}
                  label={`${tool.label} (${tool.shortcut})`}
                  onClick={() => {
                    onToolChange(tool.id);
                    resetIdleTimer();
                  }}
                />
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Utilities */}
          <div>
            <div className="px-1 pb-1 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
              Utilities
            </div>
            <div className="space-y-0.5">
              <ToolbarIconButton
                active={false}
                icon={<Crosshair className={cn("h-3.5 w-3.5", isCalibrated ? "text-green-500" : "text-destructive")} />}
                label={isCalibrated ? "Calibrated ✓" : "Set Calibration"}
                onClick={onCalibrationClick}
              />
              <ToolbarIconButton active={false} icon={<Undo2 className="h-3.5 w-3.5" />} label="Undo" onClick={onUndo} />
              <ToolbarIconButton active={false} icon={<Trash2 className="h-3.5 w-3.5" />} label="Clear measurement" onClick={onClearCurrent} />
            </div>
          </div>

          {/* Collapse */}
          <div className="h-px bg-border" />
          <ToolbarIconButton
            active={false}
            icon={<ChevronLeft className="h-3.5 w-3.5" />}
            label="Collapse toolbar"
            onClick={() => onCollapsedChange(true)}
          />

          {/* Active tool indicator */}
          {isDrawingTool && activeDef && (
            <div className="rounded-md bg-primary/10 border border-primary/20 px-2 py-1.5">
              <div className="text-[9px] font-semibold text-primary">{activeDef.label}</div>
              <div className="text-[8px] text-muted-foreground leading-snug mt-0.5">{activeDef.hint}</div>
            </div>
          )}

          {/* Modifier hint */}
          <div className="px-1 pt-0.5 text-[7px] text-muted-foreground/60 text-center leading-tight space-y-0.5">
            <div>Space+drag to pan · Scroll to zoom</div>
            <div>Height/depth/slope → Inspector</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarIconButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "default" : "ghost"}
          size="icon"
          className={cn(
            "h-7 w-7",
            active && "bg-primary text-primary-foreground shadow-sm",
            !active && "text-muted-foreground hover:text-foreground",
          )}
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-[10px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
