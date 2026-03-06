import { SubLayout } from "@/components/sub/SubLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Building2, Calculator, DollarSign, Sun, Moon, Monitor, Users, Palette,
  FileText, Layers, Plug, CreditCard, HardHat, Paintbrush, Upload, Plus, Trash2, Check
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useSubSettings } from "@/hooks/use-sub-settings";
import { allTradeNames, type TradeName } from "@/data/tradeProfiles";
import { cn } from "@/lib/utils";

type SettingsTab = "company" | "estimator" | "labor" | "material" | "templates" | "codes" | "branding" | "team" | "integrations" | "billing" | "appearance";

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "estimator", label: "Estimator Preferences", icon: Calculator },
  { id: "labor", label: "Labor & Crew", icon: HardHat },
  { id: "material", label: "Material Defaults", icon: DollarSign },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "codes", label: "Codes & Mapping", icon: Layers },
  { id: "branding", label: "Branding", icon: Paintbrush },
  { id: "team", label: "Team & Permissions", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "appearance", label: "Appearance", icon: Sun },
];

const InputField = ({ label, value, onChange, readOnly, type, helperText }: { label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string; helperText?: string }) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-1.5 block">{label}</label>
    <input
      type={type || "text"}
      className={cn("w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground", readOnly && "opacity-60")}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={readOnly}
    />
    {helperText && <p className="text-[10px] text-muted-foreground mt-1">{helperText}</p>}
  </div>
);

const SelectField = ({ label, value, options, onChange, helperText }: { label: string; value: string; options: string[]; onChange: (v: string) => void; helperText?: string }) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-1.5 block">{label}</label>
    <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {helperText && <p className="text-[10px] text-muted-foreground mt-1">{helperText}</p>}
  </div>
);

const SectionCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
    <div>
      <h2 className="font-display font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-foreground">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} className="scale-75" />
  </div>
);

const mockTeam = [
  { name: "Jake Donovan", email: "jake@trueframe.co", role: "Admin" },
  { name: "Maria Chen", email: "maria@trueframe.co", role: "Estimator" },
  { name: "Ryan Torres", email: "ryan@trueframe.co", role: "Estimator" },
  { name: "Sam Park", email: "sam@trueframe.co", role: "Viewer" },
];

const integrationList = [
  { name: "Gmail / Outlook", desc: "Email notifications and bid submissions", enabled: false },
  { name: "Google Drive / Dropbox", desc: "Cloud file storage sync", enabled: false },
  { name: "CSV / PDF Export", desc: "Estimating software data exchange", enabled: true },
  { name: "QuickBooks", desc: "Accounting & invoicing integration", enabled: false },
];

export default function SubSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, getActiveProfile } = useSubSettings();
  const profile = getActiveProfile();

  const [integrations, setIntegrations] = useState(integrationList);

  return (
    <SubLayout>
      <div className="flex h-full">
        {/* Sidebar */}
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
          {/* Company Identity Banner */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {settings.companyName.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground">{settings.companyName}</p>
              <p className="text-xs text-muted-foreground">{settings.primaryTrade} Subcontractor · {settings.region} · Theme: {theme}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">Save All</Button>
          </div>

          {/* ─── COMPANY ─── */}
          {activeTab === "company" && (
            <SectionCard title="Company Profile" subtitle="Core identity and contact information">
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Company Name" value={settings.companyName} onChange={v => updateSettings({ companyName: v })} />
                <InputField label="Company Type" value={settings.companyType} readOnly />
                <SelectField label="Primary Trade" value={settings.primaryTrade} options={allTradeNames} onChange={v => updateSettings({ primaryTrade: v as TradeName })} helperText="Drives Trade Profile defaults across all workflows" />
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Secondary Trades</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allTradeNames.filter(t => t !== settings.primaryTrade).map(t => {
                      const selected = settings.secondaryTrades.includes(t);
                      return (
                        <button key={t} onClick={() => {
                          updateSettings({
                            secondaryTrades: selected
                              ? settings.secondaryTrades.filter(s => s !== t)
                              : [...settings.secondaryTrades, t]
                          });
                        }} className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors", selected ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent")}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <InputField label="Service Region" value={settings.region} onChange={v => updateSettings({ region: v })} />
                <InputField label="City / State" value={settings.city} onChange={v => updateSettings({ city: v })} />
                <InputField label="Primary Contact" value={settings.contactName} onChange={v => updateSettings({ contactName: v })} />
                <InputField label="Email" value={settings.contactEmail} onChange={v => updateSettings({ contactEmail: v })} />
                <InputField label="Phone" value={settings.contactPhone} onChange={v => updateSettings({ contactPhone: v })} />
                <InputField label="Business Hours" value={settings.businessHours} onChange={v => updateSettings({ businessHours: v })} />
                <InputField label="Default Bid Lead Time" value={settings.bidLeadTime} onChange={v => updateSettings({ bidLeadTime: v })} />
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Signature Block</label>
                  <textarea className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground h-20 resize-none" value={settings.signatureBlock} onChange={e => updateSettings({ signatureBlock: e.target.value })} />
                </div>
              </div>
              <Button>Save Company Settings</Button>
            </SectionCard>
          )}

          {/* ─── ESTIMATOR ─── */}
          {activeTab === "estimator" && (
            <SectionCard title="Estimator Preferences" subtitle="Default pricing and quoting behavior">
              <div className="grid md:grid-cols-2 gap-4">
                <SelectField label="Default Pricing Style" value={settings.pricingStyle} options={profile.pricingStyleOptions} onChange={v => updateSettings({ pricingStyle: v })} helperText={`Recommended for ${settings.primaryTrade}: ${profile.recommendedPricingStyle}`} />
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Quote Includes</label>
                  <div className="space-y-1">
                    {(["labor", "material", "equipment", "permits", "cleanup"] as const).map(k => (
                      <ToggleRow key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} checked={settings.quoteIncludes[k]} onChange={v => updateSettings({ quoteIncludes: { ...settings.quoteIncludes, [k]: v } })} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Tax Behavior</label>
                  <div className="space-y-1">
                    <ToggleRow label="Materials taxed" checked={settings.taxMaterials} onChange={v => updateSettings({ taxMaterials: v })} />
                    <ToggleRow label="Labor taxed" checked={settings.taxLabor} onChange={v => updateSettings({ taxLabor: v })} />
                  </div>
                </div>
                <InputField label="Default Overhead %" value={String(settings.overheadPercent)} onChange={v => updateSettings({ overheadPercent: Number(v) })} type="number" />
                <InputField label="Default Profit %" value={String(settings.profitPercent)} onChange={v => updateSettings({ profitPercent: Number(v) })} type="number" />
                <InputField label="Default Contingency %" value={String(settings.contingencyPercent)} onChange={v => updateSettings({ contingencyPercent: Number(v) })} type="number" />
                <SelectField label="Rounding Rule" value={settings.roundingRule} options={["None", "Nearest $1", "Nearest $5", "Nearest $10", "Nearest $50", "Nearest $100"]} onChange={v => updateSettings({ roundingRule: v })} />
                <InputField label={`${profile.materialDefaults.wasteLabel} %`} value={String(settings.wasteFactor)} onChange={v => updateSettings({ wasteFactor: Number(v) })} type="number" helperText={`Trade default: ${profile.materialDefaults.wastePercent}%`} />
              </div>
              <Button>Save Estimator Preferences</Button>
            </SectionCard>
          )}

          {/* ─── LABOR ─── */}
          {activeTab === "labor" && (
            <SectionCard title="Labor & Crew Defaults" subtitle="Default rates, crew sizes, and production settings">
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Loaded Labor Rate ($/hr)" value={String(settings.loadedRate)} onChange={v => updateSettings({ loadedRate: Number(v) })} type="number" helperText={`Trade suggestion: $${profile.laborDefaults.loadedRate}/hr`} />
                <div><ToggleRow label="Burden Included in Rate" checked={settings.burdenIncluded} onChange={v => updateSettings({ burdenIncluded: v })} /></div>
                <InputField label="Overtime Multiplier" value={String(settings.overtimeMultiplier)} onChange={v => updateSettings({ overtimeMultiplier: Number(v) })} type="number" />
                <InputField label="Default Crew Size" value={String(settings.crewSize)} onChange={v => updateSettings({ crewSize: Number(v) })} type="number" helperText={`Trade suggestion: ${profile.laborDefaults.crewSize} workers`} />
              </div>
              <div className="bg-muted/20 rounded-xl p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Production Rate Presets (advanced)</p>
                <p>Coming soon — configure production rates per line item category for auto-estimation.</p>
              </div>
              <Button>Save Labor Defaults</Button>
            </SectionCard>
          )}

          {/* ─── MATERIAL ─── */}
          {activeTab === "material" && (
            <SectionCard title="Material Defaults" subtitle="Pricing sources, waste factors, and allowance behavior">
              <div className="grid md:grid-cols-2 gap-4">
                <SelectField label="Pricing Source" value={settings.materialPricingSource} options={["Supplier Quote", "Company Price Book", "Regional Benchmark"]} onChange={v => updateSettings({ materialPricingSource: v })} />
                <InputField label={`${profile.materialDefaults.wasteLabel} %`} value={String(settings.wasteFactor)} onChange={v => updateSettings({ wasteFactor: Number(v) })} type="number" helperText={`Trade default: ${profile.materialDefaults.wastePercent}%`} />
                <SelectField label="Hardware Allowance" value={settings.hardwareAllowance} options={["LS", "%", "Per Item"]} onChange={v => updateSettings({ hardwareAllowance: v })} />
                <div><ToggleRow label="Material Tax" checked={settings.materialTaxToggle} onChange={v => updateSettings({ materialTaxToggle: v })} /></div>
              </div>
              <Button>Save Material Defaults</Button>
            </SectionCard>
          )}

          {/* ─── TEMPLATES ─── */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <SectionCard title="Quote / Proposal Templates" subtitle="Default text blocks for proposal exports">
                <TemplateEditor label="Default Exclusions" items={settings.exclusionsTemplate.length > 0 ? settings.exclusionsTemplate : profile.defaultExclusions} onChange={v => updateSettings({ exclusionsTemplate: v })} />
                <TemplateEditor label="Default Clarifications" items={settings.clarificationsTemplate.length > 0 ? settings.clarificationsTemplate : profile.defaultClarifications} onChange={v => updateSettings({ clarificationsTemplate: v })} />
                <TemplateEditor label="Default Inclusions" items={settings.inclusionsTemplate.length > 0 ? settings.inclusionsTemplate : []} onChange={v => updateSettings({ inclusionsTemplate: v })} />
                <TemplateEditor label="Terms & Warranty" items={settings.termsTemplate} onChange={v => updateSettings({ termsTemplate: v })} />
                <p className="text-[10px] text-muted-foreground">Templates are pre-populated from your Trade Profile ({settings.primaryTrade}). Edit to customize.</p>
              </SectionCard>
            </div>
          )}

          {/* ─── CODES ─── */}
          {activeTab === "codes" && (
            <SectionCard title="Codes & Mapping" subtitle="Organization system and export code mapping">
              <div className="grid md:grid-cols-2 gap-4">
                <SelectField label="Organization System" value={settings.orgSystem} options={["Trade Categories", "Company Custom Codes"]} onChange={v => updateSettings({ orgSystem: v })} helperText="Trade Categories recommended for most subcontractors" />
                <div><ToggleRow label="Map to CSI for Export" checked={settings.mapToCsi} onChange={v => updateSettings({ mapToCsi: v })} /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Active Trade Categories ({settings.primaryTrade})</label>
                <div className="flex flex-wrap gap-1.5">
                  {profile.tradeCategories.map(c => (
                    <span key={c} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{c}</span>
                  ))}
                </div>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Custom Codes CSV Upload</p>
                <p>Upload your own cost code structure to replace or augment trade categories.</p>
                <Button variant="outline" size="sm" className="text-xs mt-2 h-7"><Upload size={12} className="mr-1" />Upload CSV</Button>
              </div>
              <Button>Save Code Settings</Button>
            </SectionCard>
          )}

          {/* ─── BRANDING ─── */}
          {activeTab === "branding" && (
            <SectionCard title="Branding" subtitle="Logo, colors, and export appearance">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Company Logo</label>
                  <div className="w-full h-24 bg-muted/30 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                    <div className="text-center">
                      <Upload size={20} className="mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Click to upload logo</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <InputField label="Company Color" value={settings.companyColor || "#22c55e"} onChange={v => updateSettings({ companyColor: v })} helperText="Used for accents on exports" />
                  <ToggleRow label="Show Logo on Exports" checked={settings.showLogoOnExports} onChange={v => updateSettings({ showLogoOnExports: v })} />
                </div>
                <InputField label="Letterhead Name" value={settings.letterheadName} onChange={v => updateSettings({ letterheadName: v })} />
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Signature Block</label>
                  <textarea className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground h-20 resize-none" value={settings.signatureBlock} onChange={e => updateSettings({ signatureBlock: e.target.value })} />
                </div>
              </div>
              <Button>Save Branding</Button>
            </SectionCard>
          )}

          {/* ─── TEAM ─── */}
          {activeTab === "team" && (
            <SectionCard title="Team & Permissions" subtitle="Manage team members and access levels">
              <div className="space-y-2">
                {mockTeam.map(m => (
                  <div key={m.email} className="flex items-center gap-3 bg-muted/20 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{m.name.split(" ").map(w => w[0]).join("")}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">{m.email}</p>
                    </div>
                    <select className="text-xs bg-background border border-border rounded-lg px-2 py-1 text-foreground" defaultValue={m.role}>
                      <option>Admin</option>
                      <option>Estimator</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="text-xs"><Plus size={12} className="mr-1" />Add Team Member</Button>
            </SectionCard>
          )}

          {/* ─── INTEGRATIONS ─── */}
          {activeTab === "integrations" && (
            <SectionCard title="Integrations" subtitle="Connect external services">
              <div className="space-y-2">
                {integrations.map((ig, i) => (
                  <div key={ig.name} className="flex items-center gap-3 bg-muted/20 rounded-xl px-4 py-3">
                    <Plug size={16} className="text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{ig.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ig.desc}</p>
                    </div>
                    <Switch checked={ig.enabled} onCheckedChange={v => setIntegrations(prev => prev.map((p, j) => j === i ? { ...p, enabled: v } : p))} className="scale-75" />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ─── BILLING ─── */}
          {activeTab === "billing" && (
            <SectionCard title="Billing" subtitle="Subscription and usage">
              <div className="bg-muted/20 rounded-xl p-6 text-center">
                <CreditCard size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground font-medium">Billing management coming soon</p>
                <p className="text-xs text-muted-foreground mt-1">View your plan, usage, and invoices here.</p>
              </div>
            </SectionCard>
          )}

          {/* ─── APPEARANCE ─── */}
          {activeTab === "appearance" && (
            <SectionCard title="Theme">
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
            </SectionCard>
          )}
        </div>
      </div>
    </SubLayout>
  );
}

// ─── Template Editor ───
function TemplateEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim()) { onChange([...items, text.trim()]); setText(""); setAdding(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <button onClick={() => setAdding(!adding)} className="text-[10px] text-primary hover:underline">+ Add</button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-foreground group">
            <span className="text-muted-foreground">•</span>
            <span className="flex-1">{item}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 size={11} /></button>
          </div>
        ))}
        {items.length === 0 && !adding && <p className="text-xs text-muted-foreground">No items. Click + Add to start.</p>}
      </div>
      {adding && (
        <div className="flex gap-2 mt-1.5">
          <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="Add item..." className="flex-1 text-sm bg-muted/30 border border-border rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary/30" autoFocus />
          <Button size="sm" variant="default" className="text-xs h-7" onClick={handleAdd}>Add</Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setAdding(false); setText(""); }}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
