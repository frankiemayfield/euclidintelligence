import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/app/DashboardPage";
import UploadPage from "./pages/app/UploadPage";
import ScopeAnalyzerPage from "./pages/app/ScopeAnalyzerPage";
import BidLevelingPage from "./pages/app/BidLevelingPage";
import EstimateBuilderPage from "./pages/app/EstimateBuilderPage";
import AtlasPage from "./pages/app/AtlasPage";
import ProposalPage from "./pages/app/ProposalPage";
import EstVsActualPage from "./pages/app/EstVsActualPage";
import ProposalComparisonPage from "./pages/app/ProposalComparisonPage";
import PricingMarginPage from "./pages/app/PricingMarginPage";
import SettingsPage from "./pages/app/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/upload" element={<UploadPage />} />
          <Route path="/app/scope-analyzer" element={<ScopeAnalyzerPage />} />
          <Route path="/app/bid-leveling" element={<BidLevelingPage />} />
          <Route path="/app/estimate-builder" element={<EstimateBuilderPage />} />
          <Route path="/app/pricing" element={<PricingMarginPage />} />
          <Route path="/app/atlas" element={<AtlasPage />} />
          <Route path="/app/proposal" element={<ProposalPage />} />
          <Route path="/app/est-vs-actual" element={<EstVsActualPage />} />
          <Route path="/app/proposal-comparison" element={<ProposalComparisonPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          {/* Legacy redirects */}
          <Route path="/app/bid-score" element={<ProposalComparisonPage />} />
          <Route path="/app/takeoff" element={<ScopeAnalyzerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
