import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AccountTypeProvider } from "@/hooks/use-account-type";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { DemoProjectProvider } from "@/hooks/use-demo-project";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/app/DashboardPage";
import UploadPage from "./pages/app/UploadPage";
import ScopeAnalyzerPage from "./pages/app/ScopeAnalyzerPage";
import BidLevelingPage from "./pages/app/BidLevelingPage";
import EstimateBuilderPage from "./pages/app/EstimateBuilderPage";
import ProposalPage from "./pages/app/ProposalPage";
import EstVsActualPage from "./pages/app/EstVsActualPage";
import ProposalComparisonPage from "./pages/app/ProposalComparisonPage";
import PricingMarginPage from "./pages/app/PricingMarginPage";
import SettingsPage from "./pages/app/SettingsPage";
import NewProjectPage from "./pages/app/NewProjectPage";
import NetworkPage from "./pages/network/NetworkPage";
import CompanyProfilePage from "./pages/network/CompanyProfilePage";
import CompliancePage from "./pages/compliance/CompliancePage";
import MessagesPage from "./pages/MessagesPage";
import ActivityPage from "./pages/ActivityPage";
import ActiveProjectsPage from "./pages/active/ActiveProjectsPage";
import OperationsOverviewPage from "./pages/operations/OperationsOverviewPage";
import ProjectsHubPage from "./pages/projects/ProjectsHubPage";
import PreconOverviewPage from "./pages/precon/PreconOverviewPage";
import MarketOutlookPage from "./pages/precon/MarketOutlookPage";
import EstimatorEntryPage from "./pages/precon/EstimatorEntryPage";
import ProjectWorkspacePage from "./pages/active/ProjectWorkspacePage";
import SchedulePage from "./pages/active/SchedulePage";
import TimeClockPage from "./pages/active/TimeClockPage";
import FinancialsOverviewPage from "./pages/financials/FinancialsOverviewPage";
import CostInboxPage from "./pages/financials/CostInboxPage";
import FinancialToolEntryPage from "./pages/financials/FinancialToolEntryPage";
import ProjectsRedirect from "./pages/projects/ProjectsRedirect";
import ProjectFinancialsPage from "./pages/financials/ProjectFinancialsPage";
import ProjectPreconPage from "./pages/projects/ProjectPreconPage";
import ProjectPreconStepPage from "./pages/projects/ProjectPreconStepPage";
import { RouteRedirect } from "./components/app/RouteRedirect";

// Auth pages
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ChooseAccountTypePage from "./pages/auth/ChooseAccountTypePage";

// Subcontractor pages
import SubDashboardPage from "./pages/sub/SubDashboardPage";
import SubUploadPage from "./pages/sub/SubUploadPage";
import SubScopeAnalyzerPage from "./pages/sub/SubScopeAnalyzerPage";
import SubBidLevelingPage from "./pages/sub/SubBidLevelingPage";
import SubEstimateBuilderPage from "./pages/sub/SubEstimateBuilderPage";
import SubPricingMarginPage from "./pages/sub/SubPricingMarginPage";
import SubMarketComparisonPage from "./pages/sub/SubMarketComparisonPage";
import SubProposalExportPage from "./pages/sub/SubProposalExportPage";
import SubEstVsActualPage from "./pages/sub/SubEstVsActualPage";
import SubSettingsPage from "./pages/sub/SubSettingsPage";
import { SubSettingsProvider } from "./hooks/use-sub-settings";

// Homeowner pages
import HomeownerOverviewPage from "./pages/homeowner/HomeownerOverviewPage";
import HomeownerUploadPage from "./pages/homeowner/HomeownerUploadPage";
import HomeownerProposalsPage from "./pages/homeowner/HomeownerProposalsPage";
import HomeownerComparisonPage from "./pages/homeowner/HomeownerComparisonPage";
import HomeownerLevelingPage from "./pages/homeowner/HomeownerLevelingPage";
import HomeownerMarketComparisonPage from "./pages/homeowner/HomeownerMarketComparisonPage";
import HomeownerBudgetPage from "./pages/homeowner/HomeownerBudgetPage";
import HomeownerInvoicesPage from "./pages/homeowner/HomeownerInvoicesPage";
import HomeownerChangeOrdersPage from "./pages/homeowner/HomeownerChangeOrdersPage";
import HomeownerDocumentsPage from "./pages/homeowner/HomeownerDocumentsPage";
import HomeownerSettingsPage from "./pages/homeowner/HomeownerSettingsPage";

const queryClient = new QueryClient();

function BuilderGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredTrack="builder"><DemoProjectProvider track="builder">{children}</DemoProjectProvider></AuthGuard>;
}
function SubGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredTrack="subcontractor"><SubSettingsProvider><DemoProjectProvider track="sub">{children}</DemoProjectProvider></SubSettingsProvider></AuthGuard>;
}
function GlobalGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const track = user?.accountTrack === "subcontractor" ? "sub" : "builder";
  const inner = <DemoProjectProvider track={track}>{children}</DemoProjectProvider>;
  return <AuthGuard>{track === "sub" ? <SubSettingsProvider>{inner}</SubSettingsProvider> : inner}</AuthGuard>;
}
function OwnerGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredTrack="homeowner"><DemoProjectProvider track="builder">{children}</DemoProjectProvider></AuthGuard>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AccountTypeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />

                {/* Auth routes */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/choose-account-type" element={<ChooseAccountTypePage />} />

                {/* ---------- Builder ---------- */}
                <Route path="/app" element={<BuilderGuard><DashboardPage /></BuilderGuard>} />
                <Route path="/app/settings" element={<BuilderGuard><SettingsPage /></BuilderGuard>} />
                <Route path="/app/new-project" element={<BuilderGuard><NewProjectPage /></BuilderGuard>} />

                {/* Projects own projects */}
                <Route path="/app/projects" element={<BuilderGuard><ProjectsHubPage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId" element={<BuilderGuard><RouteRedirect to={p => `/app/projects/${p.projectId}/overview`} /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/overview" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/schedule" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/selections" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/documents" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/activity" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/team" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/preconstruction" element={<BuilderGuard><ProjectPreconPage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/preconstruction/:step" element={<BuilderGuard><ProjectPreconStepPage /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/financials" element={<BuilderGuard><RouteRedirect to={p => `/app/projects/${p.projectId}/financials/budget`} /></BuilderGuard>} />
                <Route path="/app/projects/:projectId/financials/:tab" element={<BuilderGuard><ProjectFinancialsPage /></BuilderGuard>} />

                {/* Precon tools */}
                <Route path="/app/precon" element={<BuilderGuard><RouteRedirect to={() => "/app/precon/overview"} /></BuilderGuard>} />
                <Route path="/app/precon/overview" element={<BuilderGuard><PreconOverviewPage /></BuilderGuard>} />
                <Route path="/app/precon/estimator" element={<BuilderGuard><EstimatorEntryPage /></BuilderGuard>} />
                <Route path="/app/precon/market-outlook" element={<BuilderGuard><MarketOutlookPage /></BuilderGuard>} />
                <Route path="/app/precon/projects" element={<BuilderGuard><ProjectsRedirect stage="precon" /></BuilderGuard>} />

                {/* Operations tools */}
                <Route path="/app/operations" element={<BuilderGuard><RouteRedirect to={() => "/app/operations/overview"} /></BuilderGuard>} />
                <Route path="/app/operations/overview" element={<BuilderGuard><OperationsOverviewPage /></BuilderGuard>} />
                <Route path="/app/operations/schedule" element={<BuilderGuard><SchedulePage /></BuilderGuard>} />
                <Route path="/app/operations/time-clock" element={<BuilderGuard><TimeClockPage /></BuilderGuard>} />
                <Route path="/app/operations/projects" element={<BuilderGuard><ProjectsRedirect stage="active" /></BuilderGuard>} />

                {/* Financials tools */}
                <Route path="/app/financials" element={<BuilderGuard><RouteRedirect to={() => "/app/financials/overview"} /></BuilderGuard>} />
                <Route path="/app/financials/overview" element={<BuilderGuard><FinancialsOverviewPage /></BuilderGuard>} />
                <Route path="/app/financials/cost-inbox" element={<BuilderGuard><CostInboxPage /></BuilderGuard>} />
                <Route path="/app/financials/budget" element={<BuilderGuard><FinancialToolEntryPage /></BuilderGuard>} />
                <Route path="/app/financials/costs" element={<BuilderGuard><FinancialToolEntryPage /></BuilderGuard>} />
                <Route path="/app/financials/commitments" element={<BuilderGuard><FinancialToolEntryPage /></BuilderGuard>} />
                <Route path="/app/financials/change-orders" element={<BuilderGuard><FinancialToolEntryPage /></BuilderGuard>} />
                <Route path="/app/financials/client-billing" element={<BuilderGuard><FinancialToolEntryPage /></BuilderGuard>} />

                {/* Standalone estimating tools (company level, job-in-context) */}
                <Route path="/app/preconstruction" element={<BuilderGuard><UploadPage /></BuilderGuard>} />
                <Route path="/app/upload" element={<BuilderGuard><UploadPage /></BuilderGuard>} />
                <Route path="/app/scope-analyzer" element={<BuilderGuard><ScopeAnalyzerPage /></BuilderGuard>} />
                <Route path="/app/bid-leveling" element={<BuilderGuard><BidLevelingPage /></BuilderGuard>} />
                <Route path="/app/estimate-builder" element={<BuilderGuard><EstimateBuilderPage /></BuilderGuard>} />
                <Route path="/app/pricing" element={<BuilderGuard><PricingMarginPage /></BuilderGuard>} />
                <Route path="/app/estimate-comparison" element={<BuilderGuard><ProposalComparisonPage /></BuilderGuard>} />
                <Route path="/app/market-comparison" element={<BuilderGuard><ProposalComparisonPage /></BuilderGuard>} />
                <Route path="/app/proposal-comparison" element={<BuilderGuard><ProposalComparisonPage /></BuilderGuard>} />
                <Route path="/app/proposal" element={<BuilderGuard><ProposalPage /></BuilderGuard>} />
                <Route path="/app/est-vs-actual" element={<BuilderGuard><EstVsActualPage /></BuilderGuard>} />

                {/* Legacy builder aliases */}
                <Route path="/app/active" element={<BuilderGuard><ProjectsRedirect stage="active" /></BuilderGuard>} />
                <Route path="/app/active/:projectId" element={<BuilderGuard><RouteRedirect to={p => `/app/projects/${p.projectId}/overview`} /></BuilderGuard>} />
                <Route path="/app/active/:projectId/:tab" element={<BuilderGuard><RouteRedirect to={p => `/app/projects/${p.projectId}/${p.tab}`} /></BuilderGuard>} />
                <Route path="/app/schedule" element={<BuilderGuard><RouteRedirect to={() => "/app/operations/schedule"} /></BuilderGuard>} />
                <Route path="/app/time" element={<BuilderGuard><RouteRedirect to={() => "/app/operations/time-clock"} /></BuilderGuard>} />
                <Route path="/app/financials/inbox" element={<BuilderGuard><RouteRedirect to={() => "/app/financials/cost-inbox"} /></BuilderGuard>} />
                <Route path="/app/financials/preconstruction" element={<BuilderGuard><ProjectsRedirect stage="precon" /></BuilderGuard>} />
                <Route path="/app/financials/projects" element={<BuilderGuard><ProjectsRedirect /></BuilderGuard>} />
                <Route path="/app/financials/tool/:tab" element={<BuilderGuard><FinancialToolEntryPage /></BuilderGuard>} />
                <Route path="/app/financials/:projectId/:tab" element={<BuilderGuard><RouteRedirect to={p => `/app/projects/${p.projectId}/financials/${p.tab}`} /></BuilderGuard>} />
                <Route path="/app/financials/:projectId" element={<BuilderGuard><RouteRedirect to={p => `/app/projects/${p.projectId}/financials/budget`} /></BuilderGuard>} />

                {/* ---------- Subcontractor ---------- */}
                <Route path="/sub" element={<SubGuard><SubDashboardPage /></SubGuard>} />
                <Route path="/sub/settings" element={<SubGuard><SubSettingsPage /></SubGuard>} />

                <Route path="/sub/projects" element={<SubGuard><ProjectsHubPage /></SubGuard>} />
                <Route path="/sub/projects/:projectId" element={<SubGuard><RouteRedirect to={p => `/sub/projects/${p.projectId}/overview`} /></SubGuard>} />
                <Route path="/sub/projects/:projectId/overview" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/schedule" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/selections" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/documents" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/activity" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/team" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/preconstruction" element={<SubGuard><ProjectPreconPage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/preconstruction/:step" element={<SubGuard><ProjectPreconStepPage /></SubGuard>} />
                <Route path="/sub/projects/:projectId/financials" element={<SubGuard><RouteRedirect to={p => `/sub/projects/${p.projectId}/financials/budget`} /></SubGuard>} />
                <Route path="/sub/projects/:projectId/financials/:tab" element={<SubGuard><ProjectFinancialsPage /></SubGuard>} />

                <Route path="/sub/precon" element={<SubGuard><RouteRedirect to={() => "/sub/precon/overview"} /></SubGuard>} />
                <Route path="/sub/precon/overview" element={<SubGuard><PreconOverviewPage /></SubGuard>} />
                <Route path="/sub/precon/estimator" element={<SubGuard><EstimatorEntryPage /></SubGuard>} />
                <Route path="/sub/precon/market-outlook" element={<SubGuard><MarketOutlookPage /></SubGuard>} />
                <Route path="/sub/precon/projects" element={<SubGuard><ProjectsRedirect stage="precon" /></SubGuard>} />

                <Route path="/sub/operations" element={<SubGuard><RouteRedirect to={() => "/sub/operations/overview"} /></SubGuard>} />
                <Route path="/sub/operations/overview" element={<SubGuard><OperationsOverviewPage /></SubGuard>} />
                <Route path="/sub/operations/schedule" element={<SubGuard><SchedulePage /></SubGuard>} />
                <Route path="/sub/operations/time-clock" element={<SubGuard><TimeClockPage /></SubGuard>} />
                <Route path="/sub/operations/projects" element={<SubGuard><ProjectsRedirect stage="active" /></SubGuard>} />

                <Route path="/sub/financials" element={<SubGuard><RouteRedirect to={() => "/sub/financials/overview"} /></SubGuard>} />
                <Route path="/sub/financials/overview" element={<SubGuard><FinancialsOverviewPage /></SubGuard>} />
                <Route path="/sub/financials/cost-inbox" element={<SubGuard><CostInboxPage /></SubGuard>} />
                <Route path="/sub/financials/budget" element={<SubGuard><FinancialToolEntryPage /></SubGuard>} />
                <Route path="/sub/financials/costs" element={<SubGuard><FinancialToolEntryPage /></SubGuard>} />
                <Route path="/sub/financials/commitments" element={<SubGuard><FinancialToolEntryPage /></SubGuard>} />
                <Route path="/sub/financials/change-orders" element={<SubGuard><FinancialToolEntryPage /></SubGuard>} />
                <Route path="/sub/financials/client-billing" element={<SubGuard><FinancialToolEntryPage /></SubGuard>} />

                <Route path="/sub/preconstruction" element={<SubGuard><SubUploadPage /></SubGuard>} />
                <Route path="/sub/upload" element={<SubGuard><SubUploadPage /></SubGuard>} />
                <Route path="/sub/scope-analyzer" element={<SubGuard><SubScopeAnalyzerPage /></SubGuard>} />
                <Route path="/sub/bid-leveling" element={<SubGuard><SubBidLevelingPage /></SubGuard>} />
                <Route path="/sub/estimate-builder" element={<SubGuard><SubEstimateBuilderPage /></SubGuard>} />
                <Route path="/sub/pricing" element={<SubGuard><SubPricingMarginPage /></SubGuard>} />
                <Route path="/sub/market-comparison" element={<SubGuard><SubMarketComparisonPage /></SubGuard>} />
                <Route path="/sub/proposal" element={<SubGuard><SubProposalExportPage /></SubGuard>} />
                <Route path="/sub/est-vs-actual" element={<SubGuard><SubEstVsActualPage /></SubGuard>} />

                {/* Legacy sub aliases */}
                <Route path="/sub/active" element={<SubGuard><ProjectsRedirect stage="active" /></SubGuard>} />
                <Route path="/sub/active/:projectId" element={<SubGuard><RouteRedirect to={p => `/sub/projects/${p.projectId}/overview`} /></SubGuard>} />
                <Route path="/sub/active/:projectId/:tab" element={<SubGuard><RouteRedirect to={p => `/sub/projects/${p.projectId}/${p.tab}`} /></SubGuard>} />
                <Route path="/sub/schedule" element={<SubGuard><RouteRedirect to={() => "/sub/operations/schedule"} /></SubGuard>} />
                <Route path="/sub/time" element={<SubGuard><RouteRedirect to={() => "/sub/operations/time-clock"} /></SubGuard>} />
                <Route path="/sub/financials/inbox" element={<SubGuard><RouteRedirect to={() => "/sub/financials/cost-inbox"} /></SubGuard>} />
                <Route path="/sub/financials/preconstruction" element={<SubGuard><ProjectsRedirect stage="precon" /></SubGuard>} />
                <Route path="/sub/financials/projects" element={<SubGuard><ProjectsRedirect /></SubGuard>} />
                <Route path="/sub/financials/tool/:tab" element={<SubGuard><FinancialToolEntryPage /></SubGuard>} />
                <Route path="/sub/financials/:projectId/:tab" element={<SubGuard><RouteRedirect to={p => `/sub/projects/${p.projectId}/financials/${p.tab}`} /></SubGuard>} />
                <Route path="/sub/financials/:projectId" element={<SubGuard><RouteRedirect to={p => `/sub/projects/${p.projectId}/financials/budget`} /></SubGuard>} />

                {/* Global routes (Network, Compliance, Activity) */}
                <Route path="/network" element={<GlobalGuard><NetworkPage /></GlobalGuard>} />
                <Route path="/network/:companyId" element={<GlobalGuard><CompanyProfilePage /></GlobalGuard>} />
                <Route path="/compliance" element={<GlobalGuard><CompliancePage /></GlobalGuard>} />
                <Route path="/activity" element={<GlobalGuard><ActivityPage /></GlobalGuard>} />
                <Route path="/messages" element={<GlobalGuard><MessagesPage /></GlobalGuard>} />

                {/* Homeowner routes */}
                <Route path="/owner" element={<OwnerGuard><HomeownerOverviewPage /></OwnerGuard>} />
                <Route path="/owner/upload" element={<OwnerGuard><HomeownerUploadPage /></OwnerGuard>} />
                <Route path="/owner/proposals" element={<OwnerGuard><HomeownerProposalsPage /></OwnerGuard>} />
                <Route path="/owner/comparison" element={<OwnerGuard><HomeownerComparisonPage /></OwnerGuard>} />
                <Route path="/owner/leveling" element={<OwnerGuard><HomeownerLevelingPage /></OwnerGuard>} />
                <Route path="/owner/market-comparison" element={<OwnerGuard><HomeownerMarketComparisonPage /></OwnerGuard>} />
                <Route path="/owner/documents" element={<OwnerGuard><HomeownerDocumentsPage /></OwnerGuard>} />
                <Route path="/owner/budget" element={<OwnerGuard><HomeownerBudgetPage /></OwnerGuard>} />
                <Route path="/owner/invoices" element={<OwnerGuard><HomeownerInvoicesPage /></OwnerGuard>} />
                <Route path="/owner/change-orders" element={<OwnerGuard><HomeownerChangeOrdersPage /></OwnerGuard>} />
                <Route path="/owner/settings" element={<OwnerGuard><HomeownerSettingsPage /></OwnerGuard>} />

                {/* Legacy redirects */}
                <Route path="/app/atlas" element={<BuilderGuard><UploadPage /></BuilderGuard>} />
                <Route path="/app/bid-score" element={<BuilderGuard><ProposalComparisonPage /></BuilderGuard>} />
                <Route path="/app/takeoff" element={<BuilderGuard><ScopeAnalyzerPage /></BuilderGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AccountTypeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
