import { ChevronDown } from "lucide-react";
import { useDemoProject } from "@/hooks/use-demo-project";
import { cn } from "@/lib/utils";
import { getProjectRoute } from "@/data/demoUniverse";
import { useNavigate } from "react-router-dom";
export function ProjectSelector({ compact = false }: { compact?: boolean }) {
  const { project, projects, setProjectId, track } = useDemoProject();
  const navigate = useNavigate();
  const selectProject = (id: string) => {
    const nextProject = projects.find(option => option.id === id);
    if (!nextProject) return;
    setProjectId(id);
    navigate(getProjectRoute(nextProject, track));
  };
  return <div className={cn("relative", compact ? "w-full" : "min-w-[230px]")}>
    <select aria-label="Current project" value={project.id} onChange={event => selectProject(event.target.value)} className={cn("w-full appearance-none border border-border/70 bg-card/70 pr-8 text-foreground outline-none backdrop-blur-md focus:ring-2 focus:ring-ring", compact ? "h-9 rounded-lg px-2.5 text-[11px]" : "h-10 rounded-xl px-3 text-xs font-semibold")}>
      {projects.map(option => <option key={option.id} value={option.id}>{option.name} · {track === "builder" ? option.builderStage : option.subStage}</option>)}
    </select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>;
}
