import { createContext, useContext, useState, type ReactNode } from "react";
import { type TradeName, getTradeProfile, type TradeProfile } from "@/data/tradeProfiles";

export interface SubCompanySettings {
  companyName: string;
  companyType: string;
  primaryTrade: TradeName;
  secondaryTrades: TradeName[];
  region: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  businessHours: string;
  bidLeadTime: string;
  signatureBlock: string;
  // Estimator
  pricingStyle: string;
  quoteIncludes: { labor: boolean; material: boolean; equipment: boolean; permits: boolean; cleanup: boolean };
  taxMaterials: boolean;
  taxLabor: boolean;
  overheadPercent: number;
  profitPercent: number;
  contingencyPercent: number;
  roundingRule: string;
  wasteFactor: number;
  // Labor
  loadedRate: number;
  burdenIncluded: boolean;
  overtimeMultiplier: number;
  crewSize: number;
  // Material
  materialPricingSource: string;
  hardwareAllowance: string;
  materialTaxToggle: boolean;
  // Branding
  logoUrl: string;
  companyColor: string;
  letterheadName: string;
  showLogoOnExports: boolean;
  // Codes
  orgSystem: string;
  mapToCsi: boolean;
  // Templates
  exclusionsTemplate: string[];
  clarificationsTemplate: string[];
  inclusionsTemplate: string[];
  termsTemplate: string[];
}

const defaultSettings: SubCompanySettings = {
  companyName: "TrueFrame Carpentry",
  companyType: "Subcontractor",
  primaryTrade: "Framing",
  secondaryTrades: [],
  region: "Midwest",
  city: "Chicago, IL",
  contactName: "Jake Donovan",
  contactEmail: "jake@trueframe.co",
  contactPhone: "(312) 555-0198",
  businessHours: "7:00 AM – 4:00 PM",
  bidLeadTime: "5 business days",
  signatureBlock: "Jake Donovan, President\nTrueFrame Carpentry LLC",
  pricingStyle: "Unit Rates",
  quoteIncludes: { labor: true, material: true, equipment: false, permits: false, cleanup: true },
  taxMaterials: true,
  taxLabor: false,
  overheadPercent: 8,
  profitPercent: 12,
  contingencyPercent: 5,
  roundingRule: "Nearest $10",
  wasteFactor: 8,
  loadedRate: 62,
  burdenIncluded: true,
  overtimeMultiplier: 1.5,
  crewSize: 4,
  materialPricingSource: "Supplier Quote",
  hardwareAllowance: "LS",
  materialTaxToggle: true,
  logoUrl: "",
  companyColor: "",
  letterheadName: "TrueFrame Carpentry LLC",
  showLogoOnExports: true,
  orgSystem: "Trade Categories",
  mapToCsi: false,
  exclusionsTemplate: [],
  clarificationsTemplate: [],
  inclusionsTemplate: [],
  termsTemplate: ["Quote valid for 30 days", "Payment terms: Net 30", "Material escalation clause applies"],
};

interface SubSettingsContextType {
  settings: SubCompanySettings;
  updateSettings: (partial: Partial<SubCompanySettings>) => void;
  getActiveProfile: () => TradeProfile;
}

const SubSettingsContext = createContext<SubSettingsContextType | null>(null);

export function SubSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SubCompanySettings>(defaultSettings);

  const updateSettings = (partial: Partial<SubCompanySettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const getActiveProfile = () => getTradeProfile(settings.primaryTrade);

  return (
    <SubSettingsContext.Provider value={{ settings, updateSettings, getActiveProfile }}>
      {children}
    </SubSettingsContext.Provider>
  );
}

export function useSubSettings() {
  const ctx = useContext(SubSettingsContext);
  if (!ctx) throw new Error("useSubSettings must be used within SubSettingsProvider");
  return ctx;
}
