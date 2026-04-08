import { useState, useCallback, useEffect, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { TakeoffTool } from "../FloatingTakeoffToolbar";
import type { TakeoffMarkup } from "../PlanViewer";
import type { TakeoffRecord } from "@/data/scopeAnalyzerData";
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

interface GeometryOverlayProps {
  activeTool: TakeoffTool;
  width: number;
  height: number;
  pageNumber: number;
  selectedLineItemId?: string;
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
  shapes,
  onShapeCreated,
  onShapeUpdated,
  onShapeDeleted,
  onCreateTakeoff,
  onDrawingChange,
  onLiveMeasurement,
  markups,
}: GeometryOverlayProps) {
  const [drawing, setDrawing] = useState<DrawingState>(INITIAL_DRAWING_STATE);
  const isDrawingEnabled = activeTool !== "select" && Boolean(selectedLineItemId);
  const isSelectMode = activeTool === "select";

  useEffect(() => {
    setDrawing(INITIAL_DRAWING_STATE);
    onDrawingChange?.(false);
    onLiveMeasurement?.(null);
  }, [activeTool, pageNumber, selectedLineItemId]);

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
  }, [selectedLineItemId, pageNumber, onShapeCreated, onCreateTakeoff, onDrawingChange, onLiveMeasurement]);

  const handleClick = useCallback((e: MouseEvent<SVGSVGElement>) => {
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
      return;
    }

    if (activeTool === "rectangle") return;

    if (!drawing.activeShape) {
      const isClosedTool = activeTool === "area";
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
  }, [isDrawingEnabled, activeTool, drawing.activeShape, selectedLineItemId, pageNumber, getNormalized, commitShape, onDrawingChange, onLiveMeasurement]);

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
  }, [drawing, activeTool, shapes, isSelectMode, getNormalized, onLiveMeasurement, onShapeUpdated]);

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
    if (drawing.draggingVertexId) {
      setDrawing(prev => ({ ...prev, draggingVertexId: null }));
    }
  }, [activeTool, drawing, commitShape]);

  const handleShapeClick = useCallback((shapeId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!isSelectMode) return;
    setDrawing(prev => ({
      ...prev,
      editingShapeId: prev.editingShapeId === shapeId ? null : shapeId,
    }));
  }, [isSelectMode]);

  const handleVertexMouseDown = useCallback((vertexId: string, shapeId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!isSelectMode) return;
    setDrawing(prev => ({ ...prev, editingShapeId: shapeId, draggingVertexId: vertexId }));
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
    } else {
      onShapeUpdated({ ...shape, vertices: newVerts });
    }
  }, [shapes, onShapeUpdated, onShapeDeleted]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawing.activeShape) {
          setDrawing(INITIAL_DRAWING_STATE);
          onDrawingChange?.(false);
          onLiveMeasurement?.(null);
        } else if (drawing.editingShapeId) {
          setDrawing(prev => ({ ...prev, editingShapeId: null }));
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && drawing.editingShapeId && !drawing.activeShape) {
        onShapeDeleted(drawing.editingShapeId);
        setDrawing(prev => ({ ...prev, editingShapeId: null }));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawing, onDrawingChange, onLiveMeasurement, onShapeDeleted]);

  const pageShapes = shapes.filter(s => s.pageNumber === pageNumber);

  const cursorClass = activeTool === "select"
    ? "cursor-default"
    : isDrawingEnabled
      ? "cursor-crosshair"
      : "cursor-not-allowed";

  return (
    <svg
      className={cn("absolute inset-0 w-full h-full", cursorClass,
        activeTool === "select" && !drawing.editingShapeId ? "pointer-events-none" : "pointer-events-auto"
      )}
      viewBox={`0 0 ${width} ${height}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {pageShapes.map(shape => (
        <ShapeRenderer
          key={shape.id}
          shape={shape}
          width={width}
          height={height}
          isEditing={drawing.editingShapeId === shape.id}
          hoverEdgeIndex={drawing.editingShapeId === shape.id ? drawing.hoverEdgeIndex : null}
          onShapeClick={handleShapeClick}
          onVertexMouseDown={handleVertexMouseDown}
          onEdgeClick={handleEdgeClick}
          onVertexDelete={handleVertexDelete}
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

      {activeTool !== "select" && !selectedLineItemId && (
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
  hoverEdgeIndex,
  onShapeClick,
  onVertexMouseDown,
  onEdgeClick,
  onVertexDelete,
}: {
  shape: TakeoffShape;
  width: number;
  height: number;
  isEditing: boolean;
  hoverEdgeIndex: number | null;
  onShapeClick: (id: string, e: MouseEvent) => void;
  onVertexMouseDown: (vertexId: string, shapeId: string, e: MouseEvent) => void;
  onEdgeClick: (edgeIndex: number, shapeId: string, e: MouseEvent) => void;
  onVertexDelete: (vertexId: string, shapeId: string) => void;
}) {
  const verts = shape.vertices;
  if (verts.length === 0) return null;

  if (shape.type === "count") {
    const v = verts[0];
    return (
      <g onClick={(e) => onShapeClick(shape.id, e as unknown as MouseEvent)} className="cursor-pointer">
        <circle
          cx={v.x * width}
          cy={v.y * height}
          r={8}
          className="fill-primary/20 stroke-primary"
          strokeWidth={2}
        />
        <circle
          cx={v.x * width}
          cy={v.y * height}
          r={3}
          className="fill-primary"
        />
        {isEditing && (
          <circle
            cx={v.x * width}
            cy={v.y * height}
            r={12}
            className="fill-none stroke-primary"
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
    <g onClick={(e) => onShapeClick(shape.id, e as unknown as MouseEvent)} className="cursor-pointer">
      {shape.closed && (
        <path
          d={pathStr}
          className={cn(
            "fill-primary/10",
            isEditing && "fill-primary/20",
          )}
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
              className={cn(
                "stroke-primary",
                hoverEdgeIndex === i ? "stroke-[3]" : "stroke-[1.5]",
              )}
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

      {isEditing && verts.map(v => (
        <g key={v.id}>
          <circle
            cx={v.x * width}
            cy={v.y * height}
            r={VERTEX_RADIUS}
            className="fill-background stroke-primary stroke-[2] cursor-move"
            onMouseDown={(e) => { e.stopPropagation(); onVertexMouseDown(v.id, shape.id, e as unknown as MouseEvent); }}
            onDoubleClick={(e) => { e.stopPropagation(); onVertexDelete(v.id, shape.id); }}
          />
        </g>
      ))}

      {verts.length >= 1 && (
        <text
          x={verts[0].x * width}
          y={verts[0].y * height - 10}
          className="fill-foreground text-[9px] font-semibold"
        >
          {shape.tool}
        </text>
      )}
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
