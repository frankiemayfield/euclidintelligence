import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { HeroSection } from "@/components/marketing/HeroSection";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { StatsBand } from "@/components/marketing/StatsBand";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { AtlasSection } from "@/components/marketing/AtlasSection";
import { BuiltForSection } from "@/components/marketing/BuiltForSection";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <HeroSection />
      <TrustStrip />
      <StatsBand />
      <FeatureGrid />
      <HowItWorks />
      <AtlasSection />
      <BuiltForSection />
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
};

export default Index;
