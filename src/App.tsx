import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AccountTypeProvider } from "@/hooks/use-account-type";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AccountTypeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Builder routes */}
              <Route path="/app" element={<DashboardPage />} />
              <Route path="/app/new-project" element={<NewProjectPage />} />
              <Route path="/app/upload" element={<UploadPage />} />
              <Route path="/app/scope-analyzer" element={<ScopeAnalyzerPage />} />
              <Route path="/app/bid-leveling" element={<BidLevelingPage />} />
              <Route path="/app/estimate-builder" element={<EstimateBuilderPage />} />
              <Route path="/app/pricing" element={<PricingMarginPage />} />
              <Route path="/app/estimate-comparison" element={<ProposalComparisonPage />} />
              <Route path="/app/market-comparison" element={<ProposalComparisonPage />} />
              <Route path="/app/proposal-comparison" element={<ProposalComparisonPage />} />
              <Route path="/app/proposal" element={<ProposalPage />} />
              <Route path="/app/est-vs-actual" element={<EstVsActualPage />} />
              <Route path="/app/settings" element={<SettingsPage />} />
              {/* Subcontractor routes — wrapped in SubSettingsProvider */}
              <Route path="/sub" element={<SubSettingsProvider><SubDashboardPage /></SubSettingsProvider>} />
              <Route path="/sub/upload" element={<SubSettingsProvider><SubUploadPage /></SubSettingsProvider>} />
              <Route path="/sub/scope-analyzer" element={<SubSettingsProvider><SubScopeAnalyzerPage /></SubSettingsProvider>} />
              <Route path="/sub/bid-leveling" element={<SubSettingsProvider><SubBidLevelingPage /></SubSettingsProvider>} />
              <Route path="/sub/estimate-builder" element={<SubSettingsProvider><SubEstimateBuilderPage /></SubSettingsProvider>} />
              <Route path="/sub/pricing" element={<SubSettingsProvider><SubPricingMarginPage /></SubSettingsProvider>} />
              <Route path="/sub/market-comparison" element={<SubSettingsProvider><SubMarketComparisonPage /></SubSettingsProvider>} />
              <Route path="/sub/proposal" element={<SubSettingsProvider><SubProposalExportPage /></SubSettingsProvider>} />
              <Route path="/sub/est-vs-actual" element={<SubSettingsProvider><SubEstVsActualPage /></SubSettingsProvider>} />
              <Route path="/sub/settings" element={<SubSettingsProvider><SubSettingsPage /></SubSettingsProvider>} />
              {/* Legacy redirects */}
              <Route path="/app/atlas" element={<UploadPage />} />
              <Route path="/app/bid-score" element={<ProposalComparisonPage />} />
              <Route path="/app/takeoff" element={<ScopeAnalyzerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AccountTypeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
