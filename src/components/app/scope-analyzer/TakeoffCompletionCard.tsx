import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Replace, X } from "lucide-react";
import type { TakeoffLineItemOption } from "./PlanViewer";

interface TakeoffCompletionCardProps {
  quantity: number;
  unit: string;
  toolType: string;
  linkedLineItemId: string;
  lineItemOptions: TakeoffLineItemOption[];
  onSave: (lineItemId: string, mode: "save" | "add" | "replace") => void;
  onCancel: () => void;
}

export function TakeoffCompletionCard({
  quantity,
  unit,
  toolType,
  linkedLineItemId,
  lineItemOptions,
  onSave,
  onCancel,
}: TakeoffCompletionCardProps) {
  const [selectedLineItem, setSelectedLineItem] = useState(linkedLineItemId);

  return (
    <div className="absolute bottom-4 right-4 z-50 w-[280px] rounded-xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-foreground">Measurement Complete</h4>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-baseline justify-between rounded-lg bg-muted/50 px-3 py-2.5">
          <div>
            <div className="text-lg font-bold text-foreground font-mono tabular-nums">
              {quantity.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase">{unit}</div>
          </div>
          <div className="rounded-md bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary capitalize">
            {toolType}
          </div>
        </div>

        <div>
          <div className="mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Link to Line Item
          </div>
          <Select value={selectedLineItem} onValueChange={setSelectedLineItem}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select line item…" />
            </SelectTrigger>
            <SelectContent>
              {lineItemOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <Button
            size="sm"
            className="h-8 text-[10px] gap-1"
            onClick={() => onSave(selectedLineItem, "save")}
            disabled={!selectedLineItem}
          >
            <Check className="h-3 w-3" /> Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] gap-1"
            onClick={() => onSave(selectedLineItem, "add")}
            disabled={!selectedLineItem}
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] gap-1"
            onClick={() => onSave(selectedLineItem, "replace")}
            disabled={!selectedLineItem}
          >
            <Replace className="h-3 w-3" /> Replace
          </Button>
        </div>
      </div>
    </div>
  );
}
