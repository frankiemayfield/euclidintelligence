import { useState, useCallback, useEffect, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { TakeoffTool } from "../FloatingTakeoffToolbar";
import type { TakeoffMarkup } from "../PlanViewer";
import type { TakeoffRecord } from "@/data/scopeAnalyzerData";
import type { VisibilityMode } from "./TakeoffVisibility";
import {
  type TakeoffShape,
  type DrawingState,
  type Vertex,
  INITIAL_DRAWING_STATE,
  createVertex,
  generateId,
  isNearFirstVertex,
  closestEdge,
  computeShapeMeasurements,
  getShapeQuantity,
  getShapeUnit,
} from "./geometry";
import { getAssemblyColor } from "./assemblyColors";

interface GeometryOverlayProps {
  activeTool: TakeoffTool;
  width: number;
  height: number;
  pageNumber: number;
  selectedLineItemId?: string;
  selectedShapeId?: string | null;
  onSelectedShapeChange?: (shapeId: string | null, lineItemId?: string) => void;
  shapes: TakeoffShape[];
  onShapeCreated: (shape: TakeoffShape) => void;
  onShapeUpdated: (shape: TakeoffShape) => void;
  onShapeDeleted: (shapeId: string) => void;
  onCreateTakeoff: (payload: { markup: TakeoffMarkup; record: TakeoffRecord }) => void;
  onDrawingChange?: (drawing: boolean) => void;
  onLiveMeasurement?: (m: {
    width: number; height: number; area: number;
    perimeter: number; length: number; count: number; volume: number;
  } | null) => void;
  markups: TakeoffMarkup[];
  visibilityMode?: VisibilityMode;
  calibrationDrawMode?: boolean;
  onCalibrationLineComplete?: (line: {
    startX: number; startY: number;
    endX: number; endY: number;
    normalizedLength: number;
  }) => void;
}

const VERTEX_RADIUS = 5;
const CLOSE_THRESHOLD = 0.015;
const EDGE_INSERT_THRESHOLD = 0.012;

export function GeometryOverlay({
  activeTool,
  width,
  height,
  pageNumber,
  selectedLineItemId,
  selectedShapeId,
  onSelectedShapeChange,
  shapes,
  onShapeCreated,
  onShapeUpdated,
  onShapeDeleted,
  onCreateTakeoff,
  onDrawingChange,
  onLiveMeasurement,
  markups,
  visibilityMode = "all",
  calibrationDrawMode = false,
  onCalibrationLineComplete,
}: GeometryOverlayProps) {
  const [drawing, setDrawing] = useState<DrawingState>(INITIAL_DRAWING_STATE);
  const isCreationTool = activeTool !== "select" && activeTool !== "pan";
  const isDrawingEnabled = isCreationTool && Boolean(selectedLineItemId);
  const isSelectMode = activeTool === "select";

  const [runningCount, setRunningCount] = useState(0);
  const [draggingCountId, setDraggingCountId] = useState<string | null>(null);

  // Calibration drawing state
  const [calStart, setCalStart] = useState<{ x: number; y: number } | null>(null);
  const [calCursor, setCalCursor] = useState<{ x: number; y: number } | null>(null);

  // Reset calibration state when mode changes
  useEffect(() => {
    if (!calibrationDrawMode) {
      setCalStart(null);
      setCalCursor(null);
    }
  }, [calibrationDrawMode]);

  useEffect(() => {
    setDrawing(INITIAL_DRAWING_STATE);
    onDrawingChange?.(false);
    onLiveMeasurement?.(null);
    setRunningCount(0);
  }, [activeTool, pageNumber]);

  useEffect(() => {
    if (activeTool !== "count") {
      setDrawing(INITIAL_DRAWING_STATE);
      onDrawingChange?.(false);
      onLiveMeasurement?.(null);
    }
  }, [selectedLineItemId]);

  const getNormalized = useCallback((e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  const commitShape = useCallback((shape: TakeoffShape) => {
    if (!selectedLineItemId) return;
    const quantity = getShapeQuantity(shape);
    const unit = getShapeUnit(shape.tool);
    const takeoffId = `tk-manual-${generateId()}`;
    const finalShape: TakeoffShape = { ...shape, id: takeoffId, lineItemId: selectedLineItemId };
    onShapeCreated(finalShape);
    onCreateTakeoff({
      markup: {
        takeoffId,
        lineItemId: selectedLineItemId,
        pageNumber,
        tool: shape.tool as TakeoffTool,
        x: 0, y: 0, width: 0, height: 0,
      },
      record: {
        id: takeoffId,
        linkedLineItemId: selectedLineItemId,
        method: shape.tool === "rectangle" ? "polygon" : shape.tool === "linear" ? "linear" : shape.tool === "count" ? "count" : shape.tool === "volume" ? "volume" : "area",
        notes: `${shape.type} takeoff — ${shape.vertices.length} vertices`,
        quantity,
        sourcePage: `Page ${pageNumber}`,
        timestamp: new Date().toLocaleString(),
        unit,
      },
    });
    onDrawingChange?.(false);
    onLiveMeasurement?.(null);
    return finalShape;
  }, [selectedLineItemId, pageNumber, onShapeCreated, onCreateTakeoff, onDrawingChange, onLiveMeasurement]);

  const handleClick = useCallback((e: MouseEvent<SVGSVGElement>) => {
    // Calibration drawing mode takes priority
    if (calibrationDrawMode) {
      const pt = getNormalized(e);
      if (!calStart) {
        setCalStart(pt);
        return;
      }
      // Second click: complete the calibration line
      const dx = pt.x - calStart.x;
      const dy = pt.y - calStart.y;
      const normalizedLength = Math.sqrt(dx * dx + dy * dy);
      onCalibrationLineComplete?.({
        startX: calStart.x,
        startY: calStart.y,
        endX: pt.x,
        endY: pt.y,
        normalizedLength,
      });
      setCalStart(null);
      setCalCursor(null);
      return;
    }

    if (isSelectMode) {
      onSelectedShapeChange?.(null);
      setDrawing(prev => ({ ...prev, editingShapeId: null }));
      return;
    }

    if (!isDrawingEnabled) return;
    const pt = getNormalized(e);

    if (activeTool === "count") {
      const shape: TakeoffShape = {
        id: `shape-${generateId()}`,
        type: "count",
        vertices: [createVertex(pt.x, pt.y)],
        closed: false,
        pageNumber,
        lineItemId: selectedLineItemId!,
        tool: "count",
      };
      commitShape(shape);
      const newCount = runningCount + 1;
      setRunningCount(newCount);
      onLiveMeasurement?.({
        width: 0, height: 0, area: 0, perimeter: 0, length: 0,
        count: newCount, volume: 0,
      });
      onDrawingChange?.(true);
      return;
    }

    if (activeTool === "rectangle") return;

    if (!drawing.activeShape) {
      const isClosedTool = activeTool === "area" || activeTool === "polygon" || activeTool === "volume";
      const newShape: TakeoffShape = {
        id: `shape-${generateId()}`,
        type: isClosedTool ? "polygon" : "polyline",
        vertices: [createVertex(pt.x, pt.y)],
        closed: false,
        pageNumber,
        lineItemId: selectedLineItemId!,
        tool: activeTool,
      };
      setDrawing(prev => ({ ...prev, activeShape: newShape, cursorPos: pt }));
      onDrawingChange?.(true);
      return;
    }

    const shape = drawing.activeShape;
    const isClosedTool = shape.type === "polygon";
    if (isClosedTool && isNearFirstVertex(shape.vertices, pt, CLOSE_THRESHOLD)) {
      const finalShape: TakeoffShape = { ...shape, closed: true };
      commitShape(finalShape);
      setDrawing(INITIAL_DRAWING_STATE);
      return;
    }

    const newVert = createVertex(pt.x, pt.y);
    const updated: TakeoffShape = {
      ...shape,
      vertices: [...shape.vertices, newVert],
    };
    setDrawing(prev => ({ ...prev, activeShape: updated }));

    const m = computeShapeMeasurements(updated.vertices, null, false, updated.tool);
    onLiveMeasurement?.(m);
  }, [isSelectMode, isDrawingEnabled, activeTool, drawing.activeShape, selectedLineItemId, pageNumber, getNormalized, commitShape, onDrawingChange, onLiveMeasurement, onSelectedShapeChange, runningCount, calibrationDrawMode, calStart, onCalibrationLineComplete]);

  const handleDoubleClick = useCallback((e: MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drawing.activeShape) return;
    const shape = drawing.activeShape;
    if (shape.vertices.length < 2) {
      setDrawing(INITIAL_DRAWING_STATE);
      onDrawingChange?.(false);
      onLiveMeasurement?.(null);
      return;
    }
    const isClosedTool = shape.type === "polygon";
    const finalShape: TakeoffShape = { ...shape, closed: isClosedTool && shape.vertices.length >= 3 };
    commitShape(finalShape);
    setDrawing(INITIAL_DRAWING_STATE);
  }, [drawing.activeShape, commitShape, onDrawingChange, onLiveMeasurement]);

  const handleMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
    const pt = getNormalized(e);

    // Calibration cursor tracking
    if (calibrationDrawMode && calStart) {
      setCalCursor(pt);
      return;
    }
    // Count marker dragging
    if (draggingCountId) {
      const shape = shapes.find(s => s.id === draggingCountId);
      if (shape && shape.type === "count") {
        const updated: TakeoffShape = {
          ...shape,
          vertices: [{ ...shape.vertices[0], x: pt.x, y: pt.y }],
        };
        onShapeUpdated(updated);
      }
      return;
    }

    if (drawing.draggingVertexId && drawing.editingShapeId) {
      const shape = shapes.find(s => s.id === drawing.editingShapeId);
      if (shape) {
        const updated: TakeoffShape = {
          ...shape,
          vertices: shape.vertices.map(v =>
            v.id === drawing.draggingVertexId ? { ...v, x: pt.x, y: pt.y } : v
          ),
        };
        onShapeUpdated(updated);
      }
      return;
    }

    if (activeTool === "rectangle" && drawing.activeShape) {
      const start = drawing.activeShape.vertices[0];
      const updated: TakeoffShape = {
        ...drawing.activeShape,
        vertices: [
          start,
          createVertex(pt.x, start.y),
          createVertex(pt.x, pt.y),
          createVertex(start.x, pt.y),
        ],
      };
      setDrawing(prev => ({ ...prev, activeShape: updated, cursorPos: pt }));
      const m = computeShapeMeasurements(updated.vertices, null, true, "rectangle");
      onLiveMeasurement?.(m);
      return;
    }

    if (drawing.activeShape) {
      setDrawing(prev => ({ ...prev, cursorPos: pt }));
      const m = computeShapeMeasurements(drawing.activeShape.vertices, pt, drawing.activeShape.type === "polygon", drawing.activeShape.tool);
      onLiveMeasurement?.(m);
      return;
    }

    if (isSelectMode && drawing.editingShapeId) {
      const shape = shapes.find(s => s.id === drawing.editingShapeId);
      if (shape && shape.vertices.length >= 2) {
        const edge = closestEdge(shape.vertices, shape.closed, pt);
        if (edge && edge.distance < EDGE_INSERT_THRESHOLD) {
          setDrawing(prev => ({ ...prev, hoverEdgeIndex: edge.index }));
        } else {
          setDrawing(prev => ({ ...prev, hoverEdgeIndex: null }));
        }
      }
    }
  }, [drawing, activeTool, shapes, isSelectMode, getNormalized, onLiveMeasurement, onShapeUpdated, calibrationDrawMode, calStart, draggingCountId]);

  const handleMouseDown = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (activeTool !== "rectangle" || !isDrawingEnabled) return;
    const pt = getNormalized(e);
    const newShape: TakeoffShape = {
      id: `shape-${generateId()}`,
      type: "rectangle",
      vertices: [createVertex(pt.x, pt.y)],
      closed: true,
      pageNumber,
      lineItemId: selectedLineItemId!,
      tool: "rectangle",
    };
    setDrawing(prev => ({ ...prev, activeShape: newShape }));
    onDrawingChange?.(true);
  }, [activeTool, isDrawingEnabled, pageNumber, selectedLineItemId, getNormalized, onDrawingChange]);

  const handleMouseUp = useCallback(() => {
    if (activeTool === "rectangle" && drawing.activeShape && drawing.activeShape.vertices.length === 4) {
      commitShape(drawing.activeShape);
      setDrawing(INITIAL_DRAWING_STATE);
      return;
    }
    if (draggingCountId) {
      setDraggingCountId(null);
      return;
    }
    if (drawing.draggingVertexId) {
      setDrawing(prev => ({ ...prev, draggingVertexId: null }));
    }
  }, [activeTool, drawing, commitShape, draggingCountId]);

  const handleShapeClick = useCallback((shapeId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!isSelectMode) return;
    const shape = shapes.find(s => s.id === shapeId);
    const isAlreadySelected = selectedShapeId === shapeId;
    if (isAlreadySelected) {
      setDrawing(prev => ({
        ...prev,
        editingShapeId: prev.editingShapeId === shapeId ? null : shapeId,
      }));
    } else {
      onSelectedShapeChange?.(shapeId, shape?.lineItemId);
      setDrawing(prev => ({ ...prev, editingShapeId: null }));
    }
  }, [isSelectMode, selectedShapeId, shapes, onSelectedShapeChange]);

  const handleVertexMouseDown = useCallback((vertexId: string, shapeId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!isSelectMode) return;
    setDrawing(prev => ({ ...prev, editingShapeId: shapeId, draggingVertexId: vertexId }));
  }, [isSelectMode]);

  const handleCountMarkerDragStart = useCallback((shapeId: string, _e: MouseEvent) => {
    if (!isSelectMode) return;
    setDraggingCountId(shapeId);
  }, [isSelectMode]);

  const handleEdgeClick = useCallback((edgeIndex: number, shapeId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!isSelectMode) return;
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    const svg = (e.target as SVGElement).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const pt = {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
    const newVert = createVertex(pt.x, pt.y);
    const newVerts = [...shape.vertices];
    newVerts.splice(edgeIndex + 1, 0, newVert);
    onShapeUpdated({ ...shape, vertices: newVerts });
  }, [isSelectMode, shapes, onShapeUpdated]);

  const handleVertexDelete = useCallback((vertexId: string, shapeId: string) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    const newVerts = shape.vertices.filter(v => v.id !== vertexId);
    if (newVerts.length < 2) {
      onShapeDeleted(shapeId);
      setDrawing(prev => ({ ...prev, editingShapeId: null }));
      onSelectedShapeChange?.(null);
    } else {
      onShapeUpdated({ ...shape, vertices: newVerts });
    }
  }, [shapes, onShapeUpdated, onShapeDeleted, onSelectedShapeChange]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (calibrationDrawMode) {
          setCalStart(null);
          setCalCursor(null);
          return;
        }
        if (drawing.activeShape) {
          setDrawing(INITIAL_DRAWING_STATE);
          onDrawingChange?.(false);
          onLiveMeasurement?.(null);
        } else if (selectedShapeId || drawing.editingShapeId) {
          setDrawing(prev => ({ ...prev, editingShapeId: null }));
          onSelectedShapeChange?.(null);
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedShapeId && !drawing.activeShape) {
        e.preventDefault();
        onShapeDeleted(selectedShapeId);
        onSelectedShapeChange?.(null);
        setDrawing(prev => ({ ...prev, editingShapeId: null }));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawing, selectedShapeId, onDrawingChange, onLiveMeasurement, onShapeDeleted, onSelectedShapeChange]);

  const pageShapes = shapes.filter(s => s.pageNumber === pageNumber);

  const visibleShapes = visibilityMode === "hidden"
    ? []
    : visibilityMode === "selected"
      ? pageShapes.filter(s => s.lineItemId === selectedLineItemId)
      : pageShapes;

  const cursorClass = calibrationDrawMode
    ? "cursor-crosshair"
    : activeTool === "select"
      ? "cursor-default"
      : activeTool === "pan"
        ? "cursor-grab"
        : isDrawingEnabled
          ? "cursor-crosshair"
          : "cursor-not-allowed";

  if (activeTool === "pan") {
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
      >
        {visibleShapes.map(shape => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            width={width}
            height={height}
            isEditing={false}
            isSelected={selectedShapeId === shape.id}
            isDimmed={!!selectedShapeId && selectedShapeId !== shape.id}
            hoverEdgeIndex={null}
            onShapeClick={() => {}}
            onVertexMouseDown={() => {}}
            onEdgeClick={() => {}}
            onVertexDelete={() => {}}
            onCountMarkerDragStart={() => {}}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-auto", cursorClass)}
      viewBox={`0 0 ${width} ${height}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {visibleShapes.map(shape => (
        <ShapeRenderer
          key={shape.id}
          shape={shape}
          width={width}
          height={height}
          isEditing={drawing.editingShapeId === shape.id}
          isSelected={selectedShapeId === shape.id}
          isDimmed={!!selectedShapeId && selectedShapeId !== shape.id}
          hoverEdgeIndex={drawing.editingShapeId === shape.id ? drawing.hoverEdgeIndex : null}
          onShapeClick={handleShapeClick}
          onVertexMouseDown={handleVertexMouseDown}
          onEdgeClick={handleEdgeClick}
          onVertexDelete={handleVertexDelete}
          onCountMarkerDragStart={handleCountMarkerDragStart}
        />
      ))}

      {drawing.activeShape && (
        <ActiveShapeRenderer
          shape={drawing.activeShape}
          cursorPos={drawing.cursorPos}
          width={width}
          height={height}
        />
      )}

      {/* Calibration line overlay */}
      {calibrationDrawMode && calStart && (
        <g>
          {/* Start point */}
          <circle
            cx={calStart.x * width}
            cy={calStart.y * height}
            r={5}
            className="fill-primary stroke-primary-foreground"
            strokeWidth={2}
          />
          {/* Preview line to cursor */}
          {calCursor && (
            <>
              <line
                x1={calStart.x * width}
                y1={calStart.y * height}
                x2={calCursor.x * width}
                y2={calCursor.y * height}
                className="stroke-primary"
                strokeWidth={2}
                strokeDasharray="6 3"
                strokeLinecap="round"
              />
              <circle
                cx={calCursor.x * width}
                cy={calCursor.y * height}
                r={4}
                className="fill-primary/60"
              />
              {/* Length label */}
              {(() => {
                const mx = ((calStart.x + calCursor.x) / 2) * width;
                const my = ((calStart.y + calCursor.y) / 2) * height;
                const dx = calCursor.x - calStart.x;
                const dy = calCursor.y - calStart.y;
                const pxDist = Math.sqrt((dx * width) ** 2 + (dy * height) ** 2);
                return (
                  <text
                    x={mx}
                    y={my - 8}
                    className="fill-primary text-[10px] font-mono font-bold"
                    textAnchor="middle"
                  >
                    {Math.round(pxDist)} px
                  </text>
                );
              })()}
            </>
          )}
        </g>
      )}

      {isCreationTool && !selectedLineItemId && (
        <foreignObject x={16} y={16} width={220} height={40}>
          <div className="rounded-md border border-destructive/20 bg-background/95 px-3 py-2 text-[10px] text-muted-foreground shadow-sm">
            Select a line item before drawing.
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

function ShapeRenderer({
  shape,
  width,
  height,
  isEditing,
  isSelected,
  isDimmed,
  hoverEdgeIndex,
  onShapeClick,
  onVertexMouseDown,
  onEdgeClick,
  onVertexDelete,
  onCountMarkerDragStart,
}: {
  shape: TakeoffShape;
  width: number;
  height: number;
  isEditing: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  hoverEdgeIndex: number | null;
  onShapeClick: (id: string, e: MouseEvent) => void;
  onVertexMouseDown: (vertexId: string, shapeId: string, e: MouseEvent) => void;
  onEdgeClick: (edgeIndex: number, shapeId: string, e: MouseEvent) => void;
  onVertexDelete: (vertexId: string, shapeId: string) => void;
  onCountMarkerDragStart?: (shapeId: string, e: MouseEvent) => void;
}) {
  const verts = shape.vertices;
  if (verts.length === 0) return null;

  const assemblyColor = getAssemblyColor(shape.lineItemId);
  const strokeColor = assemblyColor.stroke;
  const fillColor = isSelected
    ? assemblyColor.fill.replace("0.15", "0.3")
    : assemblyColor.fill;
  const strokeWidth = isSelected ? 2.5 : isEditing ? 2 : 1.5;
  const opacity = isDimmed ? 0.3 : 1;

  if (shape.type === "count") {
    const v = verts[0];
    return (
      <g
        onClick={(e) => onShapeClick(shape.id, e as unknown as MouseEvent)}
        onMouseDown={isSelected ? (e) => { e.stopPropagation(); onCountMarkerDragStart?.(shape.id, e as unknown as MouseEvent); } : undefined}
        className={isSelected ? "cursor-move" : "cursor-pointer"}
        opacity={opacity}
      >
        <circle
          cx={v.x * width}
          cy={v.y * height}
          r={isSelected ? 10 : 8}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={v.x * width}
          cy={v.y * height}
          r={3}
          fill={strokeColor}
        />
        {isSelected && (
          <circle
            cx={v.x * width}
            cy={v.y * height}
            r={14}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </g>
    );
  }

  const points = verts.map(v => `${v.x * width},${v.y * height}`);
  const pathStr = shape.closed
    ? `M ${points.join(" L ")} Z`
    : `M ${points.join(" L ")}`;

  return (
    <g
      onClick={(e) => onShapeClick(shape.id, e as unknown as MouseEvent)}
      className="cursor-pointer"
      opacity={opacity}
    >
      {shape.closed && (
        <path
          d={pathStr}
          fill={fillColor}
          stroke="none"
        />
      )}

      {verts.length >= 2 && (
        <>
          {getEdges(verts, shape.closed).map((edge, i) => (
            <line
              key={`edge-${i}`}
              x1={edge.from.x * width}
              y1={edge.from.y * height}
              x2={edge.to.x * width}
              y2={edge.to.y * height}
              stroke={strokeColor}
              strokeWidth={hoverEdgeIndex === i ? 3 : strokeWidth}
              strokeLinecap="round"
              onClick={isEditing ? (e) => { e.stopPropagation(); onEdgeClick(i, shape.id, e as unknown as MouseEvent); } : undefined}
              style={isEditing ? { cursor: "copy" } : undefined}
            />
          ))}

          {getEdges(verts, shape.closed).map((edge, i) => {
            const mx = ((edge.from.x + edge.to.x) / 2) * width;
            const my = ((edge.from.y + edge.to.y) / 2) * height;
            const segLen = Math.sqrt(
              ((edge.to.x - edge.from.x) * 120) ** 2 + ((edge.to.y - edge.from.y) * 120) ** 2
            );
            if (segLen < 1) return null;
            return (
              <text
                key={`label-${i}`}
                x={mx}
                y={my - 6}
                className="fill-foreground text-[9px] font-mono"
                textAnchor="middle"
              >
                {segLen.toFixed(1)}'
              </text>
            );
          })}
        </>
      )}

      {isSelected && !isEditing && verts.length >= 2 && (
        <path
          d={pathStr}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.5}
        />
      )}

      {isEditing && verts.map(v => (
        <g key={v.id}>
          <circle
            cx={v.x * width}
            cy={v.y * height}
            r={VERTEX_RADIUS}
            className="fill-background cursor-move"
            stroke={strokeColor}
            strokeWidth={2}
            onMouseDown={(e) => { e.stopPropagation(); onVertexMouseDown(v.id, shape.id, e as unknown as MouseEvent); }}
            onDoubleClick={(e) => { e.stopPropagation(); onVertexDelete(v.id, shape.id); }}
          />
        </g>
      ))}
    </g>
  );
}

function ActiveShapeRenderer({
  shape,
  cursorPos,
  width,
  height,
}: {
  shape: TakeoffShape;
  cursorPos: { x: number; y: number } | null;
  width: number;
  height: number;
}) {
  const verts = shape.vertices;
  if (verts.length === 0) return null;

  if (shape.type === "rectangle" && verts.length === 4) {
    const points = verts.map(v => `${v.x * width},${v.y * height}`);
    return (
      <g>
        <polygon
          points={points.join(" ")}
          className="fill-primary/10 stroke-primary"
          strokeWidth={1.5}
          strokeDasharray="6 3"
        />
        {verts.map(v => (
          <circle key={v.id} cx={v.x * width} cy={v.y * height} r={4} className="fill-primary" />
        ))}
      </g>
    );
  }

  const allPts = cursorPos ? [...verts, { id: "cursor", x: cursorPos.x, y: cursorPos.y }] : verts;
  const points = allPts.map(v => `${v.x * width},${v.y * height}`);

  const nearFirst = cursorPos && shape.type === "polygon" && isNearFirstVertex(verts, cursorPos, CLOSE_THRESHOLD);

  return (
    <g>
      {allPts.length >= 2 && (
        <polyline
          points={points.join(" ")}
          className="fill-none stroke-primary"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
      )}

      {shape.type === "polygon" && allPts.length >= 3 && cursorPos && (
        <line
          x1={cursorPos.x * width}
          y1={cursorPos.y * height}
          x2={verts[0].x * width}
          y2={verts[0].y * height}
          className="stroke-primary/30"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}

      {verts.map((v, i) => (
        <circle
          key={v.id}
          cx={v.x * width}
          cy={v.y * height}
          r={i === 0 && nearFirst ? 7 : 4}
          className={cn(
            "fill-primary",
            i === 0 && nearFirst && "fill-green-500 stroke-green-300 stroke-[2]",
          )}
        />
      ))}

      {cursorPos && (
        <circle
          cx={cursorPos.x * width}
          cy={cursorPos.y * height}
          r={3}
          className="fill-primary/60"
        />
      )}

      {allPts.length >= 2 && allPts.slice(0, -1).map((v, i) => {
        const next = allPts[i + 1];
        const mx = ((v.x + next.x) / 2) * width;
        const my = ((v.y + next.y) / 2) * height;
        const segLen = Math.sqrt(
          ((next.x - v.x) * 120) ** 2 + ((next.y - v.y) * 120) ** 2
        );
        if (segLen < 0.5) return null;
        return (
          <text
            key={`seg-${i}`}
            x={mx}
            y={my - 6}
            className="fill-primary text-[9px] font-mono font-bold"
            textAnchor="middle"
          >
            {segLen.toFixed(1)}'
          </text>
        );
      })}
    </g>
  );
}

function getEdges(vertices: Vertex[], closed: boolean): { from: Vertex; to: Vertex }[] {
  const edges: { from: Vertex; to: Vertex }[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    edges.push({ from: vertices[i], to: vertices[i + 1] });
  }
  if (closed && vertices.length >= 3) {
    edges.push({ from: vertices[vertices.length - 1], to: vertices[0] });
  }
  return edges;
}
