import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  ArrowRightLeft,
  Merge,
  Split,
  Play,
  Focus,
  Pencil,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TakeoffShape } from "./takeoff/geometry";
import { getShapeQuantity, getShapeUnit } from "./takeoff/geometry";
import { getAssemblyColor } from "./takeoff/assemblyColors";

interface TakeoffContextActionsProps {
  selectedShape: TakeoffShape | null;
  isEditing: boolean;
  onEnterEditMode: () => void;
  onExitEditMode: () => void;
  onDelete: () => void;
  onReassign: (newLineItemId: string) => void;
  onContinueMeasuring: () => void;
  onIsolateSelection: () => void;
  lineItemOptions: { id: string; name: string; unit: string }[];
  currentLineItemId: string;
}

export function TakeoffContextActions({
  selectedShape,
  isEditing,
  onEnterEditMode,
  onExitEditMode,
  onDelete,
  onReassign,
  onContinueMeasuring,
  onIsolateSelection,
  lineItemOptions,
  currentLineItemId,
}: TakeoffContextActionsProps) {
  const [showReassign, setShowReassign] = useState(false);
  const [reassignTarget, setReassignTarget] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedShape) return null;

  const quantity = getShapeQuantity(selectedShape);
  const unit = getShapeUnit(selectedShape.tool);
  const color = getAssemblyColor(selectedShape.lineItemId);
  const linkedName = lineItemOptions.find(o => o.id === selectedShape.lineItemId)?.name ?? "Unknown";
  const vertexCount = selectedShape.vertices.length;

  const handleReassignConfirm = () => {
    if (reassignTarget && reassignTarget !== selectedShape.lineItemId) {
      onReassign(reassignTarget);
    }
    setShowReassign(false);
    setReassignTarget("");
  };

  return (
    <>
      <div className="border-t border-border">
        {/* Selected shape header */}
        <div className="px-3 py-2 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-3 w-3 rounded-sm border"
              style={{ backgroundColor: color.fill, borderColor: color.stroke }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Selected Capture
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold font-mono tabular-nums text-foreground">
              {quantity.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-muted-foreground">{unit}</span>
            <Badge variant="outline" className="text-[8px] px-1 py-0 capitalize">
              {selectedShape.tool}
            </Badge>
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5 truncate">
            {linkedName}
          </div>
          {selectedShape.type !== "count" && (
            <div className="text-[9px] text-muted-foreground">
              {vertexCount} vertices · Page {selectedShape.pageNumber}
            </div>
          )}
        </div>

        {/* Edit mode indicator */}
        {isEditing && (
          <div className="px-3 py-1.5 bg-primary/5 border-b border-primary/20">
            <div className="flex items-center gap-1.5 text-[9px] text-primary font-medium">
              <GripVertical className="h-3 w-3" />
              <span>Edit Mode — drag vertices, click edges to insert, double-click vertex to delete</span>
            </div>
          </div>
        )}

        {/* Context actions */}
        <div className="px-3 py-2 space-y-1">
          <h5 className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Actions
          </h5>

          {!isEditing ? (
            <ActionBtn
              icon={<Pencil className="h-3 w-3" />}
              label="Edit Geometry"
              description="Reshape vertices and edges"
              onClick={onEnterEditMode}
            />
          ) : (
            <ActionBtn
              icon={<Pencil className="h-3 w-3 text-primary" />}
              label="Exit Edit Mode"
              description="Stop editing geometry"
              onClick={onExitEditMode}
              active
            />
          )}

          <ActionBtn
            icon={<Play className="h-3 w-3" />}
            label="Continue Measuring"
            description="Add more geometry to this takeoff"
            onClick={onContinueMeasuring}
          />

          <ActionBtn
            icon={<ArrowRightLeft className="h-3 w-3" />}
            label="Reassign Line Item"
            description="Move capture to another line item"
            onClick={() => {
              setReassignTarget(selectedShape.lineItemId);
              setShowReassign(true);
            }}
          />

          <ActionBtn
            icon={<Focus className="h-3 w-3" />}
            label="Isolate Selection"
            description="Show only this item's takeoffs"
            onClick={onIsolateSelection}
          />

          <div className="h-px bg-border my-1.5" />

          <ActionBtn
            icon={<Trash2 className="h-3 w-3 text-destructive" />}
            label="Delete Capture"
            description="Remove this geometry permanently"
            onClick={() => setShowDeleteConfirm(true)}
            destructive
          />
        </div>
      </div>

      {/* Reassign dialog */}
      <Dialog open={showReassign} onOpenChange={setShowReassign}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Reassign Capture</DialogTitle>
            <DialogDescription className="text-xs">
              Move this {selectedShape.tool} capture ({quantity} {unit}) to a different line item.
              The geometry stays on the plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <label className="text-[10px] font-semibold uppercase text-muted-foreground mb-1 block">
              New Line Item
            </label>
            <Select value={reassignTarget} onValueChange={setReassignTarget}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choose line item" />
              </SelectTrigger>
              <SelectContent>
                {lineItemOptions
                  .filter(o => o.id !== selectedShape.lineItemId)
                  .map(opt => (
                    <SelectItem key={opt.id} value={opt.id} className="text-xs">
                      {opt.name} ({opt.unit})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowReassign(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              disabled={!reassignTarget || reassignTarget === selectedShape.lineItemId}
              onClick={handleReassignConfirm}
            >
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete Capture?</DialogTitle>
            <DialogDescription className="text-xs">
              This will remove the {selectedShape.tool} capture ({quantity} {unit}) from the plan and update totals.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => { setShowDeleteConfirm(false); onDelete(); }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionBtn({
  icon,
  label,
  description,
  onClick,
  destructive = false,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  destructive?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
        active
          ? "bg-primary/10 border border-primary/20"
          : destructive
            ? "hover:bg-destructive/5"
            : "hover:bg-muted/50",
      )}
      onClick={onClick}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className={cn("text-[11px] font-medium", destructive ? "text-destructive" : "text-foreground")}>
          {label}
        </div>
        <div className="text-[9px] text-muted-foreground">{description}</div>
      </div>
    </button>
  );
}
