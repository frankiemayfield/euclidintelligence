import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AccountTypeProvider } from "@/hooks/use-account-type";
import { AuthProvider } from "@/hooks/use-auth";
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

const queryClient = new QueryClient();

// Helper wrappers
function BuilderGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredTrack="builder">{children}</AuthGuard>;
}
function SubGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredTrack="subcontractor"><SubSettingsProvider>{children}</SubSettingsProvider></AuthGuard>;
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
