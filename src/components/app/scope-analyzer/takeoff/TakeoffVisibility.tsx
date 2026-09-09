import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Eye, EyeOff, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type VisibilityMode = "all" | "selected" | "hidden";

interface TakeoffVisibilityProps {
  mode: VisibilityMode;
  onChange: (mode: VisibilityMode) => void;
}

const modes: { value: VisibilityMode; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Takeoffs", icon: <Eye className="h-3 w-3" /> },
  { value: "selected", label: "Selected Line Item Only", icon: <Target className="h-3 w-3" /> },
  { value: "hidden", label: "Hide Takeoffs", icon: <EyeOff className="h-3 w-3" /> },
];

export function TakeoffVisibilityToggle({ mode, onChange }: TakeoffVisibilityProps) {
  return (
    <ToggleGroup type="single" value={mode} onValueChange={(v) => v && onChange(v as VisibilityMode)} size="sm">
      {modes.map((m) => (
        <Tooltip key={m.value}>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={m.value} className="h-6 w-6 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              {m.icon}
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px]">{m.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
