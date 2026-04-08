import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MousePointer2,
  Ruler,
  Square,
  Circle,
  Pentagon,
  Box,
  Crosshair,
  Undo2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TakeoffTool = "select" | "pan" | "linear" | "area" | "count" | "rectangle" | "polygon" | "volume";

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

const TOOL_GROUPS = [
  {
    label: "Takeoff Tools",
    tools: [
      { id: "select" as const, label: "Select / Edit", icon: MousePointer2, shortcut: "V" },
      { id: "linear" as const, label: "Linear (LF)", icon: Ruler, shortcut: "L" },
      { id: "area" as const, label: "Area (SF)", icon: Square, shortcut: "A" },
      { id: "count" as const, label: "Count (EA)", icon: Circle, shortcut: "C" },
      { id: "rectangle" as const, label: "Rectangle (SF)", icon: Square, shortcut: "R" },
      { id: "polygon" as const, label: "Polygon (SF)", icon: Pentagon, shortcut: "P" },
      { id: "volume" as const, label: "Volume (CY)", icon: Box, shortcut: "U" },
    ],
  },
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
      />

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
          {TOOL_GROUPS.map((group, gi) => (
            <div key={gi}>
              <div className="px-1 pb-1 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.tools.map((tool) => (
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
          ))}

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
          {isDrawingTool && (
            <div className="rounded-md bg-primary/10 border border-primary/20 px-2 py-1.5 text-center">
              <div className="text-[9px] font-semibold text-primary capitalize">{activeTool}</div>
              <div className="text-[8px] text-muted-foreground">
                {activeTool === "linear" ? "LF" : activeTool === "area" || activeTool === "rectangle" || activeTool === "polygon" ? "SF" : activeTool === "count" ? "EA" : "CY"}
              </div>
            </div>
          )}

          {/* Navigation hint */}
          <div className="px-1 pt-1 text-[7px] text-muted-foreground/60 text-center leading-tight">
            Space+drag to pan · Scroll to zoom
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
