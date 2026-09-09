import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProject, getQuote, projects, type DemoProject, type DemoTrack } from "@/data/demoUniverse";

interface DemoProjectContextValue {
  project: DemoProject;
  projects: DemoProject[];
  projectId: string;
  setProjectId: (id: string) => void;
  track: DemoTrack;
}
const DemoProjectContext = createContext<DemoProjectContextValue | null>(null);
const keyFor = (track: DemoTrack) => `euclid-demo-project-${track}`;

export function DemoProjectProvider({ track, children }: { track: DemoTrack; children: ReactNode }) {
  const [projectId, setProjectIdState] = useState(() => localStorage.getItem(keyFor(track)) || "fregolle");
  const project = getProject(projectId);
  const setProjectId = (id: string) => { setProjectIdState(id); localStorage.setItem(keyFor(track), id); };
  useEffect(() => { window.dispatchEvent(new CustomEvent("euclid-project-change", { detail: { projectId: project.id, track } })); }, [project.id, track]);
  const value = useMemo(() => ({ project, projects, projectId: project.id, setProjectId, track }), [project, track]);
  return <DemoProjectContext.Provider value={value}>{children}</DemoProjectContext.Provider>;
}
export function useDemoProject() {
  const context = useContext(DemoProjectContext);
  if (!context) throw new Error("useDemoProject must be used within DemoProjectProvider");
  return { ...context, quote: getQuote(context.project) };
}
