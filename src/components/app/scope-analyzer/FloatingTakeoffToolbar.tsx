import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MousePointer2,
  Hand,
  Ruler,
  Square,
  Circle,
  Pentagon,
  Box,
  Crosshair,
  Undo2,
  Trash2,
  Settings2,
  EyeOff,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TakeoffTool = "select" | "pan" | "linear" | "area" | "count" | "rectangle" | "polygon" | "volume";
export type DockPosition = "left" | "right" | "top" | "bottom";

interface FloatingTakeoffToolbarProps {
  activeTool: TakeoffTool;
  onToolChange: (tool: TakeoffTool) => void;
  onUndo: () => void;
  onClearCurrent: () => void;
  onCalibrationClick: () => void;
  onDeleteSelected?: () => void;
  isCalibrated: boolean;
  hasSelection?: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  visible: boolean;
  dockPosition?: DockPosition;
  onDockPositionChange?: (pos: DockPosition) => void;
}

const NAV_TOOLS = [
  { id: "select" as const, label: "Select", icon: MousePointer2, shortcut: "V" },
  { id: "pan" as const, label: "Pan / Grab", icon: Hand, shortcut: "H" },
];

const CREATION_TOOLS = [
  { id: "count" as const, label: "Count (EA)", icon: Circle, shortcut: "C" },
  { id: "linear" as const, label: "Linear (LF)", icon: Ruler, shortcut: "L" },
  { id: "area" as const, label: "Area (SF)", icon: Hexagon, shortcut: "A" },
  { id: "rectangle" as const, label: "Rectangle (SF)", icon: Square, shortcut: "R" },
  { id: "polygon" as const, label: "Polygon (SF)", icon: Pentagon, shortcut: "P" },
  { id: "volume" as const, label: "Volume (CY)", icon: Box, shortcut: "U" },
];

const DOCK_OPTIONS: { pos: DockPosition; label: string; icon: React.ElementType }[] = [
  { pos: "left", label: "Dock Left", icon: PanelLeft },
  { pos: "right", label: "Dock Right", icon: PanelRight },
  { pos: "top", label: "Dock Top", icon: PanelTop },
  { pos: "bottom", label: "Dock Bottom", icon: PanelBottom },
];

export function FloatingTakeoffToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onClearCurrent,
  onCalibrationClick,
  onDeleteSelected,
  isCalibrated,
  hasSelection = false,
  collapsed,
  onCollapsedChange,
  visible,
  dockPosition = "left",
  onDockPositionChange,
}: FloatingTakeoffToolbarProps) {
  if (!visible || collapsed) return null;

  const isHorizontal = dockPosition === "top" || dockPosition === "bottom";

  const positionClasses = {
    left: "absolute left-2 top-1/2 -translate-y-1/2 z-50 flex-col",
    right: "absolute right-2 top-1/2 -translate-y-1/2 z-50 flex-col",
    top: "absolute top-2 left-1/2 -translate-x-1/2 z-50 flex-row",
    bottom: "absolute bottom-2 left-1/2 -translate-x-1/2 z-50 flex-row",
  };

  const Sep = () => (
    <div className={cn(isHorizontal ? "w-px h-5 bg-border mx-0.5" : "h-px w-5 bg-border my-0.5")} />
  );

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-border bg-card/95 shadow-md backdrop-blur-md p-1 transition-all duration-200",
        positionClasses[dockPosition],
      )}
    >
      {/* Navigation tools */}
      {NAV_TOOLS.map((tool) => (
        <ToolBtn
          key={tool.id}
          active={activeTool === tool.id}
          icon={<tool.icon className="h-3.5 w-3.5" />}
          label={`${tool.label} (${tool.shortcut})`}
          onClick={() => onToolChange(tool.id)}
          horizontal={isHorizontal}
        />
      ))}

      <Sep />

      {/* Creation tools */}
      {CREATION_TOOLS.map((tool) => (
        <ToolBtn
          key={tool.id}
          active={activeTool === tool.id}
          icon={<tool.icon className="h-3.5 w-3.5" />}
          label={`${tool.label} (${tool.shortcut})`}
          onClick={() => onToolChange(tool.id)}
          horizontal={isHorizontal}
        />
      ))}

      <Sep />

      {/* Management */}
      <ToolBtn
        active={false}
        icon={<Crosshair className={cn("h-3.5 w-3.5", isCalibrated ? "text-green-500" : "text-destructive")} />}
        label={isCalibrated ? "Calibrated ✓" : "Set Calibration"}
        onClick={onCalibrationClick}
        horizontal={isHorizontal}
      />
      <ToolBtn
        active={false}
        icon={<Trash2 className={cn("h-3.5 w-3.5", hasSelection ? "text-destructive" : "")} />}
        label="Delete Selected"
        onClick={() => onDeleteSelected?.()}
        disabled={!hasSelection}
        horizontal={isHorizontal}
      />
      <ToolBtn active={false} icon={<Undo2 className="h-3.5 w-3.5" />} label="Undo" onClick={onUndo} horizontal={isHorizontal} />

      <Sep />

      {/* Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-xs">
          {DOCK_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.pos}
              onClick={() => onDockPositionChange?.(opt.pos)}
              className={cn("text-xs gap-2", dockPosition === opt.pos && "bg-accent")}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => onCollapsedChange(true)} className="text-xs gap-2">
            <EyeOff className="h-3.5 w-3.5" />
            Hide Toolbar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ToolBtn({
  active,
  icon,
  label,
  onClick,
  horizontal = false,
  disabled = false,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  horizontal?: boolean;
  disabled?: boolean;
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
            !active && !disabled && "text-muted-foreground hover:text-foreground",
            disabled && "opacity-40 cursor-not-allowed",
          )}
          onClick={onClick}
          disabled={disabled}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={horizontal ? "bottom" : "right"} className="text-[10px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
