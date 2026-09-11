import { Navigate, useLocation } from "react-router-dom";
import { useDemoProject } from "@/hooks/use-demo-project";
import { projectPreconStep, type PreconStepId } from "@/lib/routes";

/**
 * The estimator exists in exactly one place: the gated project workflow.
 * Old standalone tool URLs resolve to the same step on the active project.
 */
export function PreconToolRedirect({ step, base }: { step: PreconStepId; base: "/app" | "/sub" }) {
  const { projectId } = useDemoProject();
  const { search } = useLocation();
  return <Navigate to={`${projectPreconStep(base, projectId, step)}${search}`} replace />;
}
