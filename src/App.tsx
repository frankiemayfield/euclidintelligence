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
import ActivityPage from "./pages/ActivityPage";
import ActiveProjectsPage from "./pages/active/ActiveProjectsPage";
import ProjectWorkspacePage from "./pages/active/ProjectWorkspacePage";
import SchedulePage from "./pages/active/SchedulePage";
import TimeClockPage from "./pages/active/TimeClockPage";

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

                {/* Builder routes */}
                <Route path="/app" element={<BuilderGuard><DashboardPage /></BuilderGuard>} />
                <Route path="/app/new-project" element={<BuilderGuard><NewProjectPage /></BuilderGuard>} />
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
                <Route path="/app/settings" element={<BuilderGuard><SettingsPage /></BuilderGuard>} />

                {/* Builder construction operations */}
                <Route path="/app/active" element={<BuilderGuard><ActiveProjectsPage /></BuilderGuard>} />
                <Route path="/app/active/:projectId" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/active/:projectId/:tab" element={<BuilderGuard><ProjectWorkspacePage /></BuilderGuard>} />
                <Route path="/app/schedule" element={<BuilderGuard><SchedulePage /></BuilderGuard>} />
                <Route path="/app/time" element={<BuilderGuard><TimeClockPage /></BuilderGuard>} />

                {/* Subcontractor routes */}
                <Route path="/sub" element={<SubGuard><SubDashboardPage /></SubGuard>} />
                <Route path="/sub/upload" element={<SubGuard><SubUploadPage /></SubGuard>} />
                <Route path="/sub/scope-analyzer" element={<SubGuard><SubScopeAnalyzerPage /></SubGuard>} />
                <Route path="/sub/bid-leveling" element={<SubGuard><SubBidLevelingPage /></SubGuard>} />
                <Route path="/sub/estimate-builder" element={<SubGuard><SubEstimateBuilderPage /></SubGuard>} />
                <Route path="/sub/pricing" element={<SubGuard><SubPricingMarginPage /></SubGuard>} />
                <Route path="/sub/market-comparison" element={<SubGuard><SubMarketComparisonPage /></SubGuard>} />
                <Route path="/sub/proposal" element={<SubGuard><SubProposalExportPage /></SubGuard>} />
                <Route path="/sub/est-vs-actual" element={<SubGuard><SubEstVsActualPage /></SubGuard>} />
                <Route path="/sub/settings" element={<SubGuard><SubSettingsPage /></SubGuard>} />

                {/* Subcontractor construction operations */}
                <Route path="/sub/active" element={<SubGuard><ActiveProjectsPage /></SubGuard>} />
                <Route path="/sub/active/:projectId" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/active/:projectId/:tab" element={<SubGuard><ProjectWorkspacePage /></SubGuard>} />
                <Route path="/sub/schedule" element={<SubGuard><SchedulePage /></SubGuard>} />
                <Route path="/sub/time" element={<SubGuard><TimeClockPage /></SubGuard>} />

                {/* Global routes (Network, Compliance, Activity) */}
                <Route path="/network" element={<GlobalGuard><NetworkPage /></GlobalGuard>} />
                <Route path="/network/:companyId" element={<GlobalGuard><CompanyProfilePage /></GlobalGuard>} />
                <Route path="/compliance" element={<GlobalGuard><CompliancePage /></GlobalGuard>} />
                <Route path="/activity" element={<GlobalGuard><ActivityPage /></GlobalGuard>} />

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
