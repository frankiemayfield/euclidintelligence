import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ProjectHeader } from "@/components/app/ProjectHeader";
import { getProject } from "@/data/demoUniverse";
import { useDemoProject } from "@/hooks/use-demo-project";
import { PRECON_STEPS, projectPreconStep } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Project → Preconstruction: the estimating workflow for one project. */
export default function ProjectPreconPage() {
  const { projectId = "fregolle" } = useParams();
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const project = getProject(projectId);
  const { setProjectId } = useDemoProject();
  useEffect(() => { setProjectId(projectId); }, [projectId]);

  const stage = track === "sub" ? project.subStage : project.builderStage;
  const currentIndex = PRECON_STEPS.findIndex(s => s.label.toLowerCase().startsWith(stage.toLowerCase().slice(0, 5)));

  return (
    <TrackShell>
      <div className="app-shell py-4 lg:py-7">
        <ProjectHeader
          projectId={projectId}
          section="preconstruction"
          pillar="precon"
          subtitle={`${project.client} · ${project.location}`}
        />
        <p className="mb-4 text-sm text-muted-foreground">
          Scope, quantities, subcontractor pricing, estimated cost, client price and proposal for {project.name}.
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PRECON_STEPS.map((s, i) => (
            <Link key={s.id} to={projectPreconStep(base, projectId, s.id)}
              className={cn("odyssey-surface group rounded-2xl p-4 transition-transform hover:-translate-y-0.5",
                i === currentIndex && "ring-1 ring-primary/40")}>
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Step {i + 1}</p>
              <h2 className="mt-1 font-display text-base font-semibold">{s.label}</h2>
              <p className="mt-3 flex items-center justify-between text-[11px] font-semibold text-primary">
                Open <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </TrackShell>
  );
}
