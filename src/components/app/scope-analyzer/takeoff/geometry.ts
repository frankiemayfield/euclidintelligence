// ─── Core Geometry Types ─────────────────────────────────────────────────────

export interface Vertex {
  id: string;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
}

export interface Segment {
  from: string; // vertex id
  to: string;   // vertex id
}

export type ShapeType = "polyline" | "polygon" | "rectangle" | "count";

export interface TakeoffShape {
  id: string;
  type: ShapeType;
  vertices: Vertex[];
  closed: boolean; // true for polygon/rectangle, false for polyline
  pageNumber: number;
  lineItemId: string;
  tool: string;
}

// ─── Drawing State ───────────────────────────────────────────────────────────

export interface DrawingState {
  /** The shape being actively drawn */
  activeShape: TakeoffShape | null;
  /** Current mouse position (normalized) for rubber-band preview */
  cursorPos: { x: number; y: number } | null;
  /** Whether we're in edit mode for an existing shape */
  editingShapeId: string | null;
  /** Vertex being dragged during editing */
  draggingVertexId: string | null;
  /** Hovering over an edge (index) for vertex insertion */
  hoverEdgeIndex: number | null;
}

export const INITIAL_DRAWING_STATE: DrawingState = {
  activeShape: null,
  cursorPos: null,
  editingShapeId: null,
  draggingVertexId: null,
  hoverEdgeIndex: null,
};

// ─── Geometry Math ───────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createVertex(x: number, y: number): Vertex {
  return { id: `v-${generateId()}`, x, y };
}

/** Distance between two points (normalized coords) */
export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Total polyline length in normalized coords */
export function polylineLength(vertices: Vertex[]): number {
  let total = 0;
  for (let i = 1; i < vertices.length; i++) {
    total += distance(vertices[i - 1], vertices[i]);
  }
  return total;
}

/** Polygon area using the Shoelace formula (normalized coords) */
export function polygonArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

/** Polygon perimeter in normalized coords */
export function polygonPerimeter(vertices: Vertex[]): number {
  if (vertices.length < 2) return 0;
  let total = polylineLength(vertices);
  if (vertices.length >= 3) {
    total += distance(vertices[vertices.length - 1], vertices[0]);
  }
  return total;
}

/** Check if a point is close to the first vertex (for closing a polygon) */
export function isNearFirstVertex(
  vertices: Vertex[],
  point: { x: number; y: number },
  threshold: number = 0.015,
): boolean {
  if (vertices.length < 3) return false;
  return distance(vertices[0], point) < threshold;
}

/** Find the closest edge to a point, returns edge index and distance */
export function closestEdge(
  vertices: Vertex[],
  closed: boolean,
  point: { x: number; y: number },
): { index: number; distance: number; projection: { x: number; y: number } } | null {
  if (vertices.length < 2) return null;

  let bestDist = Infinity;
  let bestIdx = 0;
  let bestProj = { x: 0, y: 0 };

  const edges = closed ? vertices.length : vertices.length - 1;

  for (let i = 0; i < edges; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const proj = projectPointOnSegment(a, b, point);
    const d = distance(proj, point);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
      bestProj = proj;
    }
  }

  return { index: bestIdx, distance: bestDist, projection: bestProj };
}

function projectPointOnSegment(
  a: { x: number; y: number },
  b: { x: number; y: number },
  p: { x: number; y: number },
): { x: number; y: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { x: a.x, y: a.y };
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + t * dx, y: a.y + t * dy };
}

// ─── Scale Conversion ────────────────────────────────────────────────────────
// Scale factor converts normalized coords to real-world units
// Default: 1 normalized unit ≈ 120 LF (reasonable for construction plans)

const DEFAULT_SCALE_LF = 120; // LF per normalized unit
const DEFAULT_SCALE_SF = 4200; // SF per normalized unit²

export function toRealLength(normalizedLength: number, scaleLF: number = DEFAULT_SCALE_LF): number {
  return round(normalizedLength * scaleLF, 1);
}

export function toRealArea(normalizedArea: number, scaleSF: number = DEFAULT_SCALE_SF): number {
  return round(normalizedArea * scaleSF, 1);
}

export function toRealVolume(normalizedArea: number, depthFt: number = 0.33): number {
  const areaSF = toRealArea(normalizedArea);
  return round((areaSF * depthFt) / 27, 2); // CY = SF × depth / 27
}

/** Compute live measurements for a shape being drawn */
export function computeShapeMeasurements(
  vertices: Vertex[],
  cursorPos: { x: number; y: number } | null,
  closed: boolean,
  tool: string,
): {
  width: number; height: number; area: number;
  perimeter: number; length: number; count: number; volume: number;
} {
  const allPts = cursorPos ? [...vertices, createVertex(cursorPos.x, cursorPos.y)] : vertices;

  if (allPts.length < 2) {
    return { width: 0, height: 0, area: 0, perimeter: 0, length: 0, count: tool === "count" ? 1 : 0, volume: 0 };
  }

  const len = polylineLength(allPts);
  const realLength = toRealLength(len);

  if (tool === "linear") {
    return { width: 0, height: 0, area: 0, perimeter: 0, length: realLength, count: 0, volume: 0 };
  }

  // For area/polygon/rectangle tools
  const closedPts = closed || allPts.length >= 3 ? allPts : allPts;
  const area = allPts.length >= 3 ? polygonArea(closedPts) : 0;
  const perim = allPts.length >= 3 ? polygonPerimeter(closedPts) : len;
  const realArea = toRealArea(area);
  const realPerim = toRealLength(perim);

  if (tool === "volume") {
    return { width: 0, height: 0, area: realArea, perimeter: realPerim, length: 0, count: 0, volume: toRealVolume(area) };
  }

  return { width: 0, height: 0, area: realArea, perimeter: realPerim, length: realLength, count: 0, volume: 0 };
}

/** Get final quantity from a completed shape */
export function getShapeQuantity(shape: TakeoffShape): number {
  const verts = shape.vertices;
  if (shape.tool === "count") return 1;
  if (shape.tool === "linear") return toRealLength(polylineLength(verts));
  const area = polygonArea(verts);
  if (shape.tool === "volume") return toRealVolume(area);
  return toRealArea(area); // area, polygon, rectangle
}

export function getShapeUnit(tool: string): string {
  switch (tool) {
    case "linear": return "LF";
    case "area": case "rectangle": case "polygon": return "SF";
    case "volume": return "CY";
    case "count": return "EA";
    default: return "LS";
  }
}

function round(v: number, p = 0): number {
  const f = 10 ** p;
  return Math.round(v * f) / f;
}
