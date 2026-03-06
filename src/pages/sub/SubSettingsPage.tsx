import { SubLayout } from "@/components/sub/SubLayout";
import { Button } from "@/components/ui/button";
import { Building2, Palette, Calculator, DollarSign, Sun, Moon, Monitor } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

type SettingsTab = "company" | "estimator" | "pricing" | "appearance";

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "estimator", label: "Estimator Defaults", icon: Calculator },
  { id: "pricing", label: "Pricing Defaults", icon: DollarSign },
  { id: "appearance", label: "Appearance", icon: Sun },
];

export default function SubSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const { theme, setTheme } = useTheme();

  return (
    <SubLayout>
      <div className="flex h-full">
        <div className="w-56 border-r border-border bg-card shrink-0 overflow-y-auto hidden lg:block">
          <div className="p-4 border-b border-border">
            <h1 className="font-display text-lg font-bold text-foreground">Settings</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Subcontractor configuration</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                <t.icon size={15} className="shrink-0" />
                <span className="text-[13px]">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-3xl">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">TF</div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground">TrueFrame Carpentry</p>
              <p className="text-xs text-muted-foreground">Framing Subcontractor · Midwest · Theme: {theme}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">Save All</Button>
          </div>

          {activeTab === "company" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <h2 className="font-display font-semibold text-foreground">Company Profile</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Company Name", value: "TrueFrame Carpentry" },
                  { label: "Trade", value: "Framing" },
                  { label: "Region", value: "Midwest" },
                  { label: "Primary Contact", value: "Jake Donovan" },
                  { label: "Email", value: "jake@trueframe.co" },
                  { label: "Phone", value: "(312) 555-0198" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">{f.label}</label>
                    <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" defaultValue={f.value} />
                  </div>
                ))}
              </div>
              <Button>Save Company Settings</Button>
            </div>
          )}

          {activeTab === "estimator" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <h2 className="font-display font-semibold text-foreground">Estimator Defaults</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Default Trade</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground" defaultValue="Framing" readOnly />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Default Waste Factor</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground" defaultValue="8%" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Default Unit System</label>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground">
                    <option>Imperial (SF, LF, CY)</option>
                    <option>Metric</option>
                  </select>
                </div>
              </div>
              <Button>Save Estimator Defaults</Button>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <h2 className="font-display font-semibold text-foreground">Pricing Defaults</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-foreground mb-1.5 block">Default Overhead %</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground" defaultValue="8" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1.5 block">Default Profit %</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground" defaultValue="12" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1.5 block">Default Contingency %</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground" defaultValue="5" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1.5 block">Target Margin %</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground" defaultValue="18" /></div>
              </div>
              <Button>Save Pricing Defaults</Button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
              <h2 className="font-display font-semibold text-foreground">Theme</h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "light" as const, label: "Light", icon: Sun },
                  { value: "dark" as const, label: "Dark", icon: Moon },
                  { value: "system" as const, label: "System", icon: Monitor },
                ]).map(t => (
                  <button key={t.value} onClick={() => setTheme(t.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      theme === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}>
                    <t.icon size={20} className={theme === t.value ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SubLayout>
  );
}
