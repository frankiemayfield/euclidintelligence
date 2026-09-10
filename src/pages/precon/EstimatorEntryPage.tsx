import { Navigate } from "react-router-dom";
import { useTrack } from "@/components/app/TrackShell";
import { useDemoProject } from "@/hooks/use-demo-project";
import { getProjectRoute } from "@/data/demoUniverse";

/** Precon → Estimator opens the estimating application on the active project's current step. */
export default function EstimatorEntryPage() {
  const track = useTrack();
  const { project } = useDemoProject();
  return <Navigate to={getProjectRoute(project, track)} replace />;
}
