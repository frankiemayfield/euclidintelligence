import { Link, useNavigate } from "react-router-dom";
import { getProject, getProjectRoute } from "@/data/demoUniverse";
import { useDemoProject } from "@/hooks/use-demo-project";
import { useTrack } from "@/components/app/TrackShell";
import { ProjectSwitcher, hasWorkspace, lifecycleOf, type ProjectPillar } from "@/components/app/ProjectSwitcher";
import { cn } from "@/lib/utils";

export type ProjectSection = "overview" | "precon" | "schedule" | "selections" | "financials" | "documents";

/**
 * Project Mode header: back to the portfolio, the project title switcher, and one
 * restrained project-level navigation row. Tool navigation is rendered separately
 * (quieter) by each workspace via <ToolTabs />.
 */
export function ProjectHeader({
  projectId,
  section,
  pillar,
  tool,
  subtitle,
  meta,
}: {
  projectId: string;
  section: ProjectSection;
  pillar: ProjectPillar;
  tool?: string;
  subtitle?: string;
  meta?: React.ReactNode;
}) {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const navigate = useNavigate();
  const { setProjectId } = useDemoProject();
  const project = getProject(projectId);

  const go = (id: ProjectSection) => {
    if (id === "precon") { setProjectId(projectId); navigate(getProjectRoute(project, track)); return; }
    if (id === "financials") { navigate(`${base}/projects/${projectId}/financials/budget`); return; }
    if (id === "documents") { navigate(`${base}/projects/${projectId}/documents`); return; }
    if (id === "schedule") { navigate(`${base}/projects/${projectId}/schedule`); return; }
    if (id === "selections") { navigate(`${base}/projects/${projectId}/selections`); return; }
    navigate(`${base}/projects/${projectId}/overview`);
  };

  const items: { id: ProjectSection; label: string; disabled?: boolean }[] = [
    { id: "overview", label: "Overview" },
    { id: "precon", label: "Preconstruction" },
    { id: "schedule", label: "Schedule" },
    { id: "selections", label: "Selections" },
    { id: "financials", label: "Financials", disabled: !hasWorkspace("financials", projectId) },
    { id: "documents", label: "Documents" },
  ];

  return (
    <header className="mb-4">
      <Link to={`${base}/projects`} className="text-[11px] font-semibold text-primary">← Projects</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <ProjectSwitcher
          projectId={projectId}
          pillar={pillar}
          tool={tool}
          subtitle={subtitle ?? `${project.client} · ${project.location} · ${lifecycleOf(project, track)}`}
        />
        {meta}
      </div>

      <nav className="mt-3 flex flex-wrap items-center gap-4 border-b border-border/50" aria-label="Project sections">
        {items.map(i => (
          <button
            key={i.id}
            onClick={() => !i.disabled && go(i.id)}
            disabled={i.disabled}
            aria-current={section === i.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 border-transparent pb-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
              section === i.id && "border-primary text-foreground",
              i.disabled && "cursor-not-allowed opacity-40 hover:text-muted-foreground",
            )}
            title={i.disabled ? "Available once the project moves into construction" : undefined}
          >
            {i.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

/** Quiet tool navigation that sits beneath the project-level row. */
export function ToolTabs<T extends string>({ items, active, onSelect, className }: {
  items: { id: T; label: string }[];
  active: T;
  onSelect: (id: T) => void;
  className?: string;
}) {
  return (
    <nav className={cn("mb-4 flex flex-wrap items-center gap-1", className)} aria-label="Tools">
      {items.map(i => (
        <button key={i.id} onClick={() => onSelect(i.id)}
          aria-current={active === i.id ? "page" : undefined}
          className={cn(
            "rounded-lg px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground",
            active === i.id && "bg-primary/10 text-primary",
          )}>
          {i.label}
        </button>
      ))}
    </nav>
  );
}
