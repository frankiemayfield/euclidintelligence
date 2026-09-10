import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Lock, AlertTriangle, History } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ProjectHeader } from "@/components/app/ProjectHeader";
import { getProject } from "@/data/demoUniverse";
import { useDemoProject } from "@/hooks/use-demo-project";
import { projectPreconStep } from "@/lib/routes";
import { useWorkflowModel } from "@/components/app/precon/WorkflowRail";
import { overrideGate } from "@/lib/preconWorkflow";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<string, string> = {
  complete: "Complete",
  current: "In Progress",
  ready: "Ready",
  review: "Needs Review",
  locked: "Locked",
};

const STATE_CLASS: Record<string, string> = {
  complete: "bg-primary/10 text-primary",
  current: "bg-primary/15 text-primary",
  ready: "bg-muted text-muted-foreground",
  review: "bg-warning/10 text-warning",
  locked: "bg-muted/60 text-muted-foreground",
};

/** Project → Preconstruction: the gated estimating workflow map for one project. */
export default function ProjectPreconPage() {
  const { projectId = "fregolle" } = useParams();
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const project = getProject(projectId);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setProjectId } = useDemoProject();
  useEffect(() => { setProjectId(projectId); }, [projectId]);

  const model = useWorkflowModel(projectId, track);
  const blockedFrom = params.get("locked");
  const blockedStep = model.steps.find(s => s.id === blockedFrom);

  return (
    <TrackShell>
      <div className="app-shell pb-4 pt-1 lg:pb-7 lg:pt-2">
        <ProjectHeader
          projectId={projectId}
          section="preconstruction"
          pillar="precon"
          subtitle={`${project.client} · ${project.location}`}
        />
        <p className="mb-4 text-sm text-muted-foreground">
          Scope, quantities, subcontractor pricing, estimated cost, client price and proposal for {project.name}.
        </p>

        {blockedStep && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-[12.5px] text-warning">
            <Lock size={13} /> {blockedStep.label} isn’t open yet. {blockedStep.blocker}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {model.steps.map(s => {
            const locked = s.state === "locked";
            return (
              <div key={s.id}
                role={locked ? undefined : "button"}
                tabIndex={locked ? -1 : 0}
                onClick={() => !locked && navigate(projectPreconStep(base, projectId, s.id))}
                onKeyDown={e => { if (!locked && (e.key === "Enter" || e.key === " ")) navigate(projectPreconStep(base, projectId, s.id)); }}
                title={locked ? s.blocker : undefined}
                className={cn(
                  "odyssey-surface group flex flex-col rounded-2xl p-4 transition-transform",
                  !locked && "cursor-pointer hover:-translate-y-0.5",
                  s.state === "current" && "ring-1 ring-primary/40",
                  s.state === "review" && "ring-1 ring-warning/40",
                  locked && "opacity-70",
                )}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Step {s.index + 1}</p>
                  <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", STATE_CLASS[s.state])}>
                    {s.state === "complete" && <Check size={10} />}
                    {s.state === "locked" && <Lock size={9} />}
                    {s.state === "review" && <AlertTriangle size={10} />}
                    {STATE_LABEL[s.state]}
                  </span>
                </div>
                <h2 className="mt-1 font-display text-base font-semibold">{s.label}</h2>
                <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{locked ? s.blocker : s.status}</p>
                {s.overridden && <p className="mt-1 text-[10.5px] text-muted-foreground">Gate overridden by estimator</p>}

                <div className="mt-3 flex items-center justify-between">
                  {locked ? (
                    <button
                      onClick={e => { e.stopPropagation(); overrideGate(projectId, track, s.id, "Estimator proceeded without full prerequisites", "You"); }}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Proceed anyway
                    </button>
                  ) : (
                    <p className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                      Open <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {model.audit.length > 0 && (
          <section className="odyssey-surface mt-4 rounded-2xl p-4">
            <h3 className="flex items-center gap-1.5 font-display text-sm font-semibold"><History size={13} /> Workflow history</h3>
            <ul className="mt-2 space-y-1.5">
              {model.audit.slice(0, 8).map((entry, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-muted-foreground">
                  <span className="font-medium text-foreground">{entry.action}</span>
                  {entry.detail && <span>— {entry.detail}</span>}
                  <span className="text-[11px]">{entry.by} · {new Date(entry.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </TrackShell>
  );
}
