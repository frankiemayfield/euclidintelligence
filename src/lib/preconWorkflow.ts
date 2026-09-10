/**
 * Preconstruction workflow state: gating, completion, review propagation and audit.
 *
 * State is derived from the canonical demo project stage and then overlaid with
 * anything the estimator has done in-session (marked a step complete, overrode a
 * gate, uploaded a bid that invalidated downstream work). Nothing here changes
 * estimating math — it only describes where the project is in the workflow.
 */
import { PRECON_STEPS, type PreconStepId } from "@/lib/routes";
import { getProject, type DemoProject, type DemoTrack, type WorkflowStage } from "@/data/demoUniverse";

export type StepState = "complete" | "current" | "ready" | "review" | "locked";

export interface WorkflowAuditEntry {
  at: string;
  by: string;
  step: PreconStepId;
  action: string;
  detail?: string;
}

interface WorkflowOverlay {
  completed: PreconStepId[];
  review: PreconStepId[];
  overrides: { step: PreconStepId; reason: string; by: string; at: string }[];
  audit: WorkflowAuditEntry[];
}

const EMPTY: WorkflowOverlay = { completed: [], review: [], overrides: [], audit: [] };

const storeKey = (projectId: string, track: DemoTrack) => `euclid-precon-workflow-${track}-${projectId}`;

const cache = new Map<string, WorkflowOverlay>();
const listeners = new Set<() => void>();

function read(projectId: string, track: DemoTrack): WorkflowOverlay {
  const key = storeKey(projectId, track);
  if (cache.has(key)) return cache.get(key)!;
  let value = EMPTY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) value = { ...EMPTY, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  cache.set(key, value);
  return value;
}

function write(projectId: string, track: DemoTrack, next: WorkflowOverlay) {
  const key = storeKey(projectId, track);
  cache.set(key, next);
  try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach(l => l());
}

export function subscribeWorkflow(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/* ------------------------------------------------------------------ */
/* Baseline: where the canonical demo data says the project is         */
/* ------------------------------------------------------------------ */

const STAGE_TO_STEP: Record<WorkflowStage, PreconStepId | "done"> = {
  "Document Upload": "documents",
  "Scope Analyzer": "scope",
  "Bid Packages": "bid-packages",
  "Estimate": "estimate",
  "Pricing & Margin": "pricing",
  "Proposal Export": "proposal",
  "Market Comparison": "market-comparison",
  "Est. vs Actual": "done",
};

export const STEP_ORDER = PRECON_STEPS.map(s => s.id) as PreconStepId[];

export const SHORT_LABELS: Record<PreconStepId, string> = {
  documents: "Documents",
  scope: "Scope",
  "bid-packages": "Bids",
  estimate: "Estimate",
  pricing: "Pricing",
  proposal: "Proposal",
  "market-comparison": "Market",
};

export const FULL_LABELS: Record<PreconStepId, string> = {
  documents: "Documents",
  scope: "Scope Analyzer",
  "bid-packages": "Bid Packages",
  estimate: "Estimate",
  pricing: "Pricing & Margin",
  proposal: "Proposal",
  "market-comparison": "Market Comparison",
};

function baselineIndex(project: DemoProject, track: DemoTrack) {
  const stage = track === "sub" ? project.subStage : project.builderStage;
  const step = STAGE_TO_STEP[stage];
  return step === "done" ? STEP_ORDER.length : STEP_ORDER.indexOf(step);
}

/* ------------------------------------------------------------------ */
/* Per-step status copy derived from canonical project data            */
/* ------------------------------------------------------------------ */

function statusFor(step: PreconStepId, project: DemoProject, state: StepState): string {
  const docs = project.scopeCoverage ?? 0;
  switch (step) {
    case "documents":
      return state === "locked" ? "Upload plans, specs and addenda to begin"
        : state === "complete" ? "Source set processed and classified"
        : "Plans, specs and addenda in intake";
    case "scope":
      return project.assumptions > 0
        ? `${project.assumptions} assumption${project.assumptions === 1 ? "" : "s"} to confirm · ${docs}% scope coverage`
        : `Takeoff reconciled · ${docs}% scope coverage`;
    case "bid-packages":
      return project.attention?.includes("bid")
        ? project.attention
        : state === "complete" ? "Packages leveled and carried into the estimate" : "Compare and normalize subcontractor bids";
    case "estimate":
      return state === "complete" ? "Cost structure priced and marked ready" : "Price scope rows and resolve open items";
    case "pricing":
      return project.markup != null ? `Markup ${project.markup}% · client price ${project.clientPrice ? `$${project.clientPrice.toLocaleString()}` : "pending"}`
        : "Set markup, fees and client price";
    case "proposal":
      return project.proposalScore != null ? `Proposal ready · readiness ${project.proposalScore}` : "Generate the client proposal";
    case "market-comparison":
      return project.marketPosition ? `Benchmarked · ${project.marketPosition}` : "Benchmark the estimate against the market";
  }
}

function blockerFor(step: PreconStepId): string {
  const index = STEP_ORDER.indexOf(step);
  const previous = FULL_LABELS[STEP_ORDER[index - 1]];
  const verbs: Record<PreconStepId, string> = {
    documents: "",
    scope: "analyzing scope",
    "bid-packages": "building bid packages",
    estimate: "building the estimate",
    pricing: "setting pricing and margin",
    proposal: "creating the proposal",
    "market-comparison": "benchmarking the estimate",
  };
  return `Complete ${previous} before ${verbs[step]}.`;
}

export interface WorkflowStep {
  id: PreconStepId;
  label: string;
  short: string;
  index: number;
  state: StepState;
  status: string;
  blocker?: string;
  overridden?: boolean;
}

export interface WorkflowModel {
  steps: WorkflowStep[];
  currentId: PreconStepId;
  audit: WorkflowAuditEntry[];
  reviewCount: number;
}

export function computeWorkflow(projectId: string, track: DemoTrack, activeStep?: PreconStepId): WorkflowModel {
  const project = getProject(projectId);
  const overlay = read(projectId, track);
  const base = baselineIndex(project, track);

  const completed = new Set<PreconStepId>(STEP_ORDER.slice(0, Math.max(0, base)));
  overlay.completed.forEach(id => completed.add(id));
  overlay.overrides.forEach(o => completed.add(o.step));
  const review = new Set<PreconStepId>(overlay.review);

  // Furthest reachable step: first not-complete step.
  const firstOpen = STEP_ORDER.find(id => !completed.has(id)) ?? STEP_ORDER[STEP_ORDER.length - 1];
  const currentId = activeStep ?? firstOpen;

  const steps: WorkflowStep[] = STEP_ORDER.map((id, index) => {
    const previous = index === 0 ? undefined : STEP_ORDER[index - 1];
    const unlocked = index === 0 || (previous ? completed.has(previous) : true);
    let state: StepState;
    if (!unlocked) state = "locked";
    else if (review.has(id)) state = "review";
    else if (id === currentId) state = "current";
    else if (completed.has(id)) state = "complete";
    else state = "ready";
    return {
      id,
      label: FULL_LABELS[id],
      short: SHORT_LABELS[id],
      index,
      state,
      status: statusFor(id, project, state),
      blocker: state === "locked" ? blockerFor(id) : undefined,
      overridden: overlay.overrides.some(o => o.step === id),
    };
  });

  return { steps, currentId, audit: overlay.audit, reviewCount: review.size };
}

export function isStepUnlocked(projectId: string, track: DemoTrack, step: PreconStepId) {
  const model = computeWorkflow(projectId, track, step);
  return model.steps.find(s => s.id === step)?.state !== "locked";
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

function audit(overlay: WorkflowOverlay, entry: WorkflowAuditEntry): WorkflowOverlay {
  return { ...overlay, audit: [entry, ...overlay.audit].slice(0, 40) };
}

export function markStepComplete(projectId: string, track: DemoTrack, step: PreconStepId, by: string) {
  const overlay = read(projectId, track);
  const next = audit(
    {
      ...overlay,
      completed: Array.from(new Set([...overlay.completed, step])),
      review: overlay.review.filter(id => id !== step),
    },
    { at: new Date().toISOString(), by, step, action: `${FULL_LABELS[step]} marked complete` },
  );
  write(projectId, track, next);
}

export function overrideGate(projectId: string, track: DemoTrack, step: PreconStepId, reason: string, by: string) {
  const overlay = read(projectId, track);
  const next = audit(
    { ...overlay, overrides: [...overlay.overrides, { step, reason, by, at: new Date().toISOString() }] },
    { at: new Date().toISOString(), by, step, action: `${FULL_LABELS[step]} gate overridden`, detail: reason },
  );
  write(projectId, track, next);
}

/** Flag every stage after `from` as needing review — used when upstream data changes. */
export function flagDownstreamReview(projectId: string, track: DemoTrack, from: PreconStepId, by: string, detail: string) {
  const overlay = read(projectId, track);
  const start = STEP_ORDER.indexOf(from);
  const affected = STEP_ORDER.slice(start, start + 5);
  const next = audit(
    { ...overlay, review: Array.from(new Set([...overlay.review, ...affected])) },
    { at: new Date().toISOString(), by, step: from, action: "Downstream stages flagged for review", detail },
  );
  write(projectId, track, next);
}

export function clearReview(projectId: string, track: DemoTrack, step: PreconStepId, by: string) {
  const overlay = read(projectId, track);
  const next = audit(
    { ...overlay, review: overlay.review.filter(id => id !== step) },
    { at: new Date().toISOString(), by, step, action: `${FULL_LABELS[step]} reviewed` },
  );
  write(projectId, track, next);
}
