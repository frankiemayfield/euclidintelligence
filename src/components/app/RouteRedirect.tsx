import { Navigate, useParams, useLocation } from "react-router-dom";

/**
 * Legacy-route compatibility. Builds the canonical destination from the matched
 * params so old deep links keep working after the Projects-owns-projects move.
 */
export function RouteRedirect({ to }: { to: (params: Record<string, string | undefined>, search: string) => string }) {
  const params = useParams();
  const { search } = useLocation();
  return <Navigate to={to(params, search)} replace />;
}
