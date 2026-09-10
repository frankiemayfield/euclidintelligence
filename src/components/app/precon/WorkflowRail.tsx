import { createContext, useContext, useSyncExternalStore, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, AlertTriangle, ChevronRight, LayoutGrid, ArrowRight, ChevronDown } from "lucide-react";
import { computeWorkflow, subscribeWorkflow, markStepComplete, type WorkflowModel } from "@/lib/preconWorkflow";
import { projectPreconStep, projectSection, type PreconStepId } from "@/lib/routes";
import type { DemoTrack } from "@/data/demoUniverse";
import { cn } from "@/lib/utils";

interface PreconWorkflowValue {
  projectId: string;
  track: DemoTrack;
  base: "/app" | "/sub";
  step: PreconStepId;
}

const PreconWorkflowContext = createContext<PreconWorkflowValue | null>(null);
export const PreconWorkflowProvider = PreconWorkflowContext.Provider;
export const usePreconWorkflowContext = () => useContext(PreconWorkflowContext);

/** Live workflow model that re-renders whenever a stage is completed or flagged. */
export function useWorkflowModel(projectId: string, track: DemoTrack, step?: PreconStepId): WorkflowModel {
  const snapshot = useSyncExternalStore(
    subscribeWorkflow,
    () => JSON.stringify(computeWorkflow(projectId, track, step)),
    () => JSON.stringify(computeWorkflow(projectId, track, step)),
  );
  return JSON.parse(snapshot) as WorkflowModel;
}

const stateDot: Record<string, string> = {
  complete: "bg-primary",
  current: "bg-primary",
  ready: "bg-muted-foreground/40",
  review: "bg-warning",
  locked: "bg-muted-foreground/25",
};

/**
 * Persistent estimator workflow navigation. Sits above every preconstruction
 * tool so the user can move backward freely and forward only through open gates.
 */
export function WorkflowRail() {
  const ctx = usePreconWorkflowContext();
  if (!ctx) return null;
  return <WorkflowRailInner {...ctx} />;
}

function WorkflowRailInner({ projectId, track, base, step }: PreconWorkflowValue) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const model = useWorkflowModel(projectId, track, step);
  const active = model.steps.find(s => s.id === step)!;
  const next = model.steps[active.index + 1];
  const nextLocked = next?.state === "locked";

  const go = (id: PreconStepId, locked: boolean) => {
    if (locked) return;
    navigate(projectPreconStep(base, projectId, id));
  };

  const advance = () => {
    markStepComplete(projectId, track, step, "You");
    if (next) navigate(projectPreconStep(base, projectId, next.id));
    else navigate(projectSection(base, projectId, "preconstruction"));
  };

  return (
    <div className="sticky top-0 z-30 mb-3 rounded-2xl border border-border/60 bg-card/85 px-3 py-1.5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(projectSection(base, projectId, "preconstruction"))}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          title="Workflow overview"
        >
          <LayoutGrid size={13} /> <span className="hidden sm:inline">Workflow</span>
        </button>

        {/* Desktop rail */}
        <div className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex">
          {model.steps.map((s, i) => {
            const locked = s.state === "locked";
            return (
              <div key={s.id} className="flex min-w-0 items-center">
                {i > 0 && <ChevronRight size={11} className="mx-0.5 shrink-0 text-muted-foreground/40" />}
                <button
                  onClick={() => go(s.id, locked)}
                  disabled={locked}
                  aria-current={s.id === step ? "step" : undefined}
                  title={locked ? s.blocker : s.status}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-medium transition-colors",
                    s.id === step ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    locked && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-muted-foreground",
                  )}
                >
                  {s.state === "complete" ? <Check size={11} className="text-primary" />
                    : s.state === "review" ? <AlertTriangle size={11} className="text-warning" />
                    : locked ? <Lock size={10} />
                    : <span className={cn("h-1.5 w-1.5 rounded-full", stateDot[s.state])} />}
                  <span className="truncate">{i + 1}. {s.short}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Mobile step selector */}
        <div className="relative min-w-0 flex-1 md:hidden">
          <button onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 px-2.5 py-1.5 text-[12px] font-medium">
            <span className="truncate">Step {active.index + 1} · {active.label}</span>
            <ChevronDown size={13} />
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              {model.steps.map(s => (
                <button key={s.id} disabled={s.state === "locked"}
                  onClick={() => { setOpen(false); go(s.id, s.state === "locked"); }}
                  className={cn("flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px]",
                    s.id === step ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
                    s.state === "locked" && "opacity-45")}>
                  <span>{s.index + 1}. {s.label}</span>
                  {s.state === "locked" ? <Lock size={11} /> : s.state === "complete" ? <Check size={12} className="text-primary" /> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={advance}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          title={next ? `Mark ${active.label} complete and open ${next.label}` : `Mark ${active.label} complete`}
        >
          {next ? (nextLocked ? `Complete & open ${next.short}` : `Next: ${next.short}`) : "Mark complete"}
          <ArrowRight size={12} />
        </button>
      </div>

      {active.state === "review" && (
        <p className="mt-1 flex items-center gap-1.5 px-1 text-[11px] text-warning">
          <AlertTriangle size={11} /> Upstream data changed — review this stage before moving on.
        </p>
      )}
    </div>
  );
}
