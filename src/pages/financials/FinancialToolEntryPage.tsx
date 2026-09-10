import { Navigate, useParams } from "react-router-dom";
import { useTrack } from "@/components/app/TrackShell";
import { financialProjectIds } from "@/data/financialData";
import { getRecentProject } from "@/lib/projectContext";

const TABS = ["budget", "costs", "commitments", "changes", "billing"];

/**
 * Financials → Budget / Costs / Commitments / Change Orders / Client Billing.
 * These are the same project financial tools, entered without first picking a
 * project: we resolve the most recent valid project context and hand off.
 */
export default function FinancialToolEntryPage() {
  const { tab = "budget" } = useParams();
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const tool = TABS.includes(tab) ? tab : "budget";
  const recent = getRecentProject("financials");
  const projectId = recent && financialProjectIds.includes(recent.projectId) ? recent.projectId : financialProjectIds[0];
  return <Navigate to={`${base}/projects/${projectId}/financials/${tool}`} replace />;
}
