// Persistent assembly color palette — same color used across overlays, hierarchy, log, inspector
const ASSEMBLY_PALETTE = [
  { fill: "hsla(210, 80%, 55%, 0.15)", stroke: "hsl(210, 80%, 55%)", accent: "hsl(210, 80%, 55%)" },
  { fill: "hsla(150, 65%, 45%, 0.15)", stroke: "hsl(150, 65%, 45%)", accent: "hsl(150, 65%, 45%)" },
  { fill: "hsla(30, 85%, 55%, 0.15)", stroke: "hsl(30, 85%, 55%)", accent: "hsl(30, 85%, 55%)" },
  { fill: "hsla(280, 65%, 55%, 0.15)", stroke: "hsl(280, 65%, 55%)", accent: "hsl(280, 65%, 55%)" },
  { fill: "hsla(0, 70%, 55%, 0.15)", stroke: "hsl(0, 70%, 55%)", accent: "hsl(0, 70%, 55%)" },
  { fill: "hsla(180, 60%, 45%, 0.15)", stroke: "hsl(180, 60%, 45%)", accent: "hsl(180, 60%, 45%)" },
  { fill: "hsla(60, 70%, 45%, 0.15)", stroke: "hsl(60, 70%, 45%)", accent: "hsl(60, 70%, 45%)" },
  { fill: "hsla(330, 65%, 55%, 0.15)", stroke: "hsl(330, 65%, 55%)", accent: "hsl(330, 65%, 55%)" },
] as const;

export interface AssemblyColor {
  fill: string;
  stroke: string;
  accent: string;
}

const colorMap = new Map<string, AssemblyColor>();
let nextIndex = 0;

export function getAssemblyColor(assemblyId: string): AssemblyColor {
  let c = colorMap.get(assemblyId);
  if (!c) {
    c = ASSEMBLY_PALETTE[nextIndex % ASSEMBLY_PALETTE.length];
    colorMap.set(assemblyId, c);
    nextIndex++;
  }
  return c;
}

export function getAssemblyColorCSS(assemblyId: string): string {
  return getAssemblyColor(assemblyId).accent;
}

/** Stronger variant for selected line item within an assembly */
export function getSelectedLineItemStyle(assemblyId: string) {
  const base = getAssemblyColor(assemblyId);
  return {
    fill: base.fill.replace("0.15", "0.3"),
    stroke: base.stroke,
    strokeWidth: 3,
    glow: `0 0 8px ${base.accent}`,
  };
}
