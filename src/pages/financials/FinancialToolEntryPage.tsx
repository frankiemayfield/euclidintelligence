import { Navigate, useLocation, useParams } from "react-router-dom";
import { useTrack } from "@/components/app/TrackShell";
import { financialProjectIds } from "@/data/financialData";
import { getRecentProject } from "@/lib/projectContext";
import { FINANCIAL_TOOL_SLUGS, financialSlugForTab, projectFinancialTool } from "@/lib/routes";

/**
 * Financials → Budget / Costs / Commitments / Change Orders / Client Billing.
 * These are the same project financial tools, entered without first picking a
 * project: we resolve the most recent valid project context and hand off.
 */
export default function FinancialToolEntryPage() {
  const params = useParams();
  const { pathname } = useLocation();
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const slug = params.tab ?? pathname.split("/").pop() ?? "budget";
  const tab = FINANCIAL_TOOL_SLUGS[slug] ?? "budget";
  const recent = getRecentProject("financials");
  const projectId = recent && financialProjectIds.includes(recent.projectId) ? recent.projectId : financialProjectIds[0];
  return <Navigate to={projectFinancialTool(base, projectId, financialSlugForTab[tab])} replace />;
}
