import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTrack } from "@/components/app/TrackShell";
import { useDemoProject } from "@/hooks/use-demo-project";
import { projectSection, type PreconStepId } from "@/lib/routes";

import UploadPage from "@/pages/app/UploadPage";
import ScopeAnalyzerPage from "@/pages/app/ScopeAnalyzerPage";
import BidLevelingPage from "@/pages/app/BidLevelingPage";
import EstimateBuilderPage from "@/pages/app/EstimateBuilderPage";
import PricingMarginPage from "@/pages/app/PricingMarginPage";
import ProposalPage from "@/pages/app/ProposalPage";
import ProposalComparisonPage from "@/pages/app/ProposalComparisonPage";
import SubUploadPage from "@/pages/sub/SubUploadPage";
import SubScopeAnalyzerPage from "@/pages/sub/SubScopeAnalyzerPage";
import SubBidLevelingPage from "@/pages/sub/SubBidLevelingPage";
import SubEstimateBuilderPage from "@/pages/sub/SubEstimateBuilderPage";
import SubPricingMarginPage from "@/pages/sub/SubPricingMarginPage";
import SubProposalExportPage from "@/pages/sub/SubProposalExportPage";
import SubMarketComparisonPage from "@/pages/sub/SubMarketComparisonPage";

const BUILDER: Record<PreconStepId, React.ComponentType> = {
  documents: UploadPage,
  scope: ScopeAnalyzerPage,
  "bid-packages": BidLevelingPage,
  estimate: EstimateBuilderPage,
  pricing: PricingMarginPage,
  proposal: ProposalPage,
  "market-comparison": ProposalComparisonPage,
};
const SUB: Record<PreconStepId, React.ComponentType> = {
  documents: SubUploadPage,
  scope: SubScopeAnalyzerPage,
  "bid-packages": SubBidLevelingPage,
  estimate: SubEstimateBuilderPage,
  pricing: SubPricingMarginPage,
  proposal: SubProposalExportPage,
  "market-comparison": SubMarketComparisonPage,
};

/** Renders one estimating tool with the project from the URL as the active job. */
export default function ProjectPreconStepPage() {
  const { projectId = "fregolle", step } = useParams();
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const { setProjectId } = useDemoProject();
  useEffect(() => { setProjectId(projectId); }, [projectId]);

  const map = track === "sub" ? SUB : BUILDER;
  const Tool = step && step in map ? map[step as PreconStepId] : undefined;
  if (!Tool) return <Navigate to={projectSection(base, projectId, "preconstruction")} replace />;
  return <Tool />;
}
