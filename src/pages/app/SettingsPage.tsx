import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Upload, Sun, Moon, Monitor, Users, Link2, Settings2, Building2, Palette, Calculator, DollarSign, FileOutput, Bell, Shield, Globe, Check } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { WorkspaceAppearancePicker } from "@/components/app/WorkspaceAppearancePicker";
import companyLogoImg from "@/assets/company-logo.jpg";
import { companies, people } from "@/data/demoUniverse";

type SettingsTab = "company" | "branding" | "estimator" | "pricing" | "proposal" | "appearance" | "notifications" | "users" | "integrations" | "workspace";

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "estimator", label: "Estimator Defaults", icon: Calculator },
  { id: "pricing", label: "Pricing Defaults", icon: DollarSign },
  { id: "proposal", label: "Proposal Defaults", icon: FileOutput },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "users", label: "Users & Permissions", icon: Users },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "workspace", label: "Workspace", icon: Settings2 },
];

const teamMembers = [
  { name: people.frankie.name, email: people.frankie.email, role: people.frankie.title, status: "Active" },
  { name: people.jordan.name, email: people.jordan.email, role: people.jordan.title, status: "Active" },
];

const integrations = [
  { name: "Buildertrend", desc: "Sync project data and cost codes", status: "Connected" },
  { name: "QuickBooks", desc: "Accounting and invoicing sync", status: "Not Connected" },
  { name: "Excel / CSV Export", desc: "One-click export in standard formats", status: "Connected" },
  { name: "Email / SMTP", desc: "Send proposals and scope packages via email", status: "Coming Soon" },
  { name: "Cloud Storage", desc: "Auto-backup project files", status: "Coming Soon" },
  { name: "API Access", desc: "Custom integrations and data pipelines", status: "Coming Soon" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-foreground mb-1.5 block">{children}</label>;
}

function FieldInput({ defaultValue, placeholder, type = "text" }: { defaultValue?: string; placeholder?: string; type?: string }) {
  return <input type={type} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" defaultValue={defaultValue} placeholder={placeholder} />;
}

function FieldSelect({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) {
  return <select defaultValue={defaultValue} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground">{children}</select>;
}

function Toggle({ defaultChecked = false, label }: { defaultChecked?: boolean; label: string }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button onClick={() => setOn(!on)} className="flex items-center justify-between w-full p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
      <span className="text-sm text-foreground">{label}</span>
      <div className={`w-9 h-5 rounded-full transition-colors relative ${on ? "bg-primary" : "bg-border"}`}>
        <div className={`w-4 h-4 rounded-full bg-primary-foreground absolute top-0.5 transition-all ${on ? "left-4" : "left-0.5"}`} />
      </div>
    </button>
  );
}

function SectionCard({ title, children, helper }: { title: string; children: React.ReactNode; helper?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <h2 className="font-display font-semibold text-foreground mb-1">{title}</h2>
      {helper && <p className="text-xs text-muted-foreground mb-4">{helper}</p>}
      {!helper && <div className="mb-4" />}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Settings sidebar */}
        <div className="w-56 border-r border-border bg-card shrink-0 overflow-y-auto hidden lg:block">
          <div className="p-4 border-b border-border">
            <h1 className="font-display text-lg font-bold text-foreground">Settings</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Company & app configuration</p>
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

        {/* Mobile tab selector */}
        <div className="lg:hidden w-full">
          <div className="p-4 border-b border-border">
            <h1 className="font-display text-lg font-bold text-foreground mb-2">Settings</h1>
            <select value={activeTab} onChange={e => setActiveTab(e.target.value as SettingsTab)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-3xl">
          {/* Summary header */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border border-border">
              <img src={companyLogoImg} alt="Company Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground">Mayfield & Co.</p>
              <p className="text-xs text-muted-foreground">Theme: {theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"} · Pricing: Cost Plus · 4 users · 1 integration</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">Save All</Button>
          </div>

          {/* ===== COMPANY ===== */}
          {activeTab === "company" && (
            <div className="space-y-6">
              <SectionCard title="Company Profile" helper="Your company identity across Euclid">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><FieldLabel>Company Name</FieldLabel><FieldInput defaultValue={companies.mayfield.name} /></div>
                  <div><FieldLabel>Company Email</FieldLabel><FieldInput defaultValue="info@mayfield.co" type="email" /></div>
                  <div><FieldLabel>Phone</FieldLabel><FieldInput defaultValue="(312) 555-0142" /></div>
                  <div><FieldLabel>Website</FieldLabel><FieldInput defaultValue="www.mayfield.co" /></div>
                  <div className="md:col-span-2"><FieldLabel>Address</FieldLabel><FieldInput defaultValue="Cincinnati, OH" /></div>
                  <div><FieldLabel>Default Region / Market</FieldLabel>
                    <FieldSelect defaultValue="Midwest"><option>Northeast</option><option>Southeast</option><option>Midwest</option><option>Southwest</option><option>West Coast</option><option>Pacific NW</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Primary Contact</FieldLabel><FieldInput defaultValue={people.frankie.name} /></div>
                  <div><FieldLabel>Contact Role</FieldLabel><FieldInput defaultValue={people.frankie.title} /></div>
                  <div><FieldLabel>Tax ID</FieldLabel><FieldInput placeholder="XX-XXXXXXX" /></div>
                  <div><FieldLabel>License / Contractor #</FieldLabel><FieldInput placeholder="e.g. IL-GC-2024-1234" /></div>
                </div>
              </SectionCard>
              <SectionCard title="Company Logo" helper="Appears in the app header alongside your company name">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={companyLogoImg} alt="Company Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <button onClick={() => setCompanyLogo("uploaded")} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <Upload size={14} /> Upload logo
                    </button>
                    <p className="text-xs text-muted-foreground mt-1">Euclid branding remains in the sidebar. Your logo is your workspace identity.</p>
                  </div>
                </div>
              </SectionCard>
              <Button>Save Company Settings</Button>
            </div>
          )}

          {/* ===== BRANDING ===== */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <SectionCard title="Proposal Branding" helper="Control how your company appears on client-facing proposals">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FieldLabel>Proposal Header Logo</FieldLabel>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-12 bg-muted/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-border">Preview</div>
                      <button className="text-sm text-primary hover:text-primary/80"><Upload size={14} className="inline mr-1" />Upload</button>
                    </div>
                  </div>
                  <div><FieldLabel>Proposal Accent Color</FieldLabel><FieldInput defaultValue="#2D7A3A" type="color" /></div>
                  <div><FieldLabel>Default Proposal Title Style</FieldLabel>
                    <FieldSelect><option>Project Name + Date</option><option>Company Name + Project</option><option>Custom Template</option></FieldSelect>
                  </div>
                  <div className="md:col-span-2"><FieldLabel>Proposal Footer Text</FieldLabel><FieldInput defaultValue="Prepared by Mayfield & Co. — All pricing valid for 30 days." /></div>
                </div>
                <div className="mt-4 space-y-2">
                  <Toggle label="Branded cover page" defaultChecked />
                  <Toggle label="Include company logo on every page" defaultChecked />
                  <Toggle label="Client-facing logo usage" defaultChecked />
                </div>
              </SectionCard>
              <Button>Save Branding</Button>
            </div>
          )}

          {/* ===== ESTIMATOR DEFAULTS ===== */}
          {activeTab === "estimator" && (
            <div className="space-y-6">
              <SectionCard title="Estimator Defaults" helper="Default settings applied to new projects">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><FieldLabel>Default Project Type</FieldLabel>
                    <FieldSelect><option>Remodel</option><option>Custom Home</option><option>Addition</option><option>Tenant Finish</option><option>Commercial Rehab</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Default Spec Level</FieldLabel>
                    <FieldSelect defaultValue="Mid-Tier"><option>Builder Grade</option><option>Mid-Tier</option><option>Premium</option><option>Luxury</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Default Unit Preferences</FieldLabel>
                    <FieldSelect><option>Imperial (SF, LF, CY)</option><option>Metric (m², m, m³)</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Default Region Assumptions</FieldLabel>
                    <FieldSelect defaultValue="Midwest"><option>Northeast</option><option>Southeast</option><option>Midwest</option><option>Southwest</option><option>West Coast</option></FieldSelect>
                  </div>
                  <div className="md:col-span-2"><FieldLabel>Default Project Notes Template</FieldLabel>
                    <textarea className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring h-20 resize-none text-foreground" defaultValue="Standard project notes template. Update as needed for each project." />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Trade Package Templates" helper="Default trade packages for scope and bid leveling">
                <div className="space-y-2">
                  {["Concrete", "Framing", "Electrical", "Plumbing", "HVAC", "Drywall", "Flooring", "Roofing", "Painting"].map(t => (
                    <div key={t} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm text-foreground">{t}</span>
                      <span className="text-xs text-primary font-medium">Configured</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <Button>Save Estimator Defaults</Button>
            </div>
          )}

          {/* ===== PRICING DEFAULTS ===== */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <SectionCard title="Pricing Defaults" helper="Default pricing strategy for new projects">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><FieldLabel>Default Pricing Mode</FieldLabel>
                    <FieldSelect defaultValue="Cost Plus"><option>Cost Plus</option><option>Fixed Fee</option><option>Lump Sum</option><option>GMP</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Default Overhead %</FieldLabel><FieldInput defaultValue="8" /></div>
                  <div><FieldLabel>Default Profit %</FieldLabel><FieldInput defaultValue="10" /></div>
                  <div><FieldLabel>Default Markup %</FieldLabel><FieldInput defaultValue="18" /></div>
                  <div><FieldLabel>Default Contingency %</FieldLabel><FieldInput defaultValue="5" /></div>
                  <div><FieldLabel>Default Tax Rate</FieldLabel><FieldInput defaultValue="7.5" /></div>
                  <div><FieldLabel>Default Fee Style</FieldLabel>
                    <FieldSelect><option>Percentage fee</option><option>Flat fee</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Default Fee Visibility</FieldLabel>
                    <FieldSelect><option>Shown separately</option><option>Included in total</option><option>Internal only</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Target Margin %</FieldLabel><FieldInput defaultValue="18" /></div>
                  <div><FieldLabel>Margin Warning Threshold</FieldLabel><FieldInput defaultValue="15" /></div>
                </div>
              </SectionCard>
              <SectionCard title="Markup Application" helper="Control which cost categories receive default markup">
                <div className="space-y-2">
                  <Toggle label="Apply markup to labor" defaultChecked />
                  <Toggle label="Apply markup to materials" defaultChecked />
                  <Toggle label="Apply markup to subcontractors" defaultChecked />
                  <Toggle label="Apply markup to equipment" defaultChecked />
                  <Toggle label="Apply markup to general conditions" defaultChecked />
                  <Toggle label="Apply markup to allowances" />
                </div>
              </SectionCard>
              <Button>Save Pricing Defaults</Button>
            </div>
          )}

          {/* ===== PROPOSAL DEFAULTS ===== */}
          {activeTab === "proposal" && (
            <div className="space-y-6">
              <SectionCard title="Proposal Defaults" helper="Default behavior for proposal generation">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><FieldLabel>Default Proposal View</FieldLabel>
                    <FieldSelect><option>Detailed</option><option>Grouped</option><option>Lump Sum</option><option>Owner Summary</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Proposal Numbering Format</FieldLabel><FieldInput defaultValue="PROP-{YYYY}-{###}" placeholder="e.g. PROP-2026-001" /></div>
                </div>
                <div className="mt-4 space-y-2">
                  <Toggle label="Show fee separately by default" defaultChecked />
                  <Toggle label="Show contingency by default" />
                  <Toggle label="Show tax separately by default" defaultChecked />
                  <Toggle label="Include exclusions section" defaultChecked />
                  <Toggle label="Include assumptions log" defaultChecked />
                  <Toggle label="Include scope summary" defaultChecked />
                  <Toggle label="Include signature / approval block" />
                </div>
              </SectionCard>
              <Button>Save Proposal Defaults</Button>
            </div>
          )}

          {/* ===== APPEARANCE ===== */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <SectionCard title="Workspace appearance" helper="Choose color mode and the drafting environment behind your workspace">
                <WorkspaceAppearancePicker />
              </SectionCard>
              <SectionCard title="Display" helper="Customize density and motion preferences">
                <div className="space-y-2">
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div><FieldLabel>Layout Density</FieldLabel>
                      <FieldSelect><option>Comfortable</option><option>Compact</option></FieldSelect>
                    </div>
                    <div><FieldLabel>Table Density</FieldLabel>
                      <FieldSelect><option>Default</option><option>Compact</option><option>Spacious</option></FieldSelect>
                    </div>
                  </div>
                  <Toggle label="Reduce motion" />
                  <Toggle label="High contrast mode" />
                </div>
              </SectionCard>
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <SectionCard title="Notification Preferences" helper="Choose what you want to be notified about">
                <div className="space-y-2">
                  <Toggle label="Project updated" defaultChecked />
                  <Toggle label="Sub bid received" defaultChecked />
                  <Toggle label="Scope issue flagged" defaultChecked />
                  <Toggle label="Pricing below target margin" defaultChecked />
                  <Toggle label="Proposal ready to send" defaultChecked />
                  <Toggle label="Proposal above market benchmark" />
                  <Toggle label="Review required" defaultChecked />
                  <Toggle label="System alerts" defaultChecked />
                </div>
              </SectionCard>
              <SectionCard title="Delivery Channels" helper="How you receive notifications">
                <div className="space-y-2">
                  <Toggle label="In-app notifications" defaultChecked />
                  <Toggle label="Email notifications" defaultChecked />
                  <Toggle label="Daily digest summary" />
                </div>
              </SectionCard>
            </div>
          )}

          {/* ===== USERS & PERMISSIONS ===== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <SectionCard title="Team Members" helper="Manage who has access to your Euclid workspace">
                <div className="flex justify-end mb-3">
                  <Button size="sm" className="text-xs"><Users size={12} className="mr-1.5" />Add User</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Name", "Email", "Role", "Status"].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map(m => (
                        <tr key={m.email} className="border-b border-border last:border-0">
                          <td className="px-3 py-2.5 font-medium text-foreground">{m.name}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{m.email}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              m.role === "Admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>{m.role}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              m.status === "Active" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                            }`}>{m.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
              <SectionCard title="Roles & Permissions" helper="Define what each role can access">
                <div className="space-y-3">
                  {[
                    { role: "Admin", perms: ["Create projects", "Edit estimates", "Edit pricing", "Send proposals", "Manage settings", "View all projects"] },
                    { role: "Estimator", perms: ["Create projects", "Edit estimates", "Edit pricing", "Send proposals", "View all projects"] },
                    { role: "Project Manager", perms: ["View all projects", "Send proposals"] },
                    { role: "Viewer", perms: ["View assigned projects"] },
                  ].map(r => (
                    <div key={r.role} className="p-3 bg-muted/20 rounded-lg">
                      <p className="text-sm font-semibold text-foreground mb-1.5">{r.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {r.perms.map(p => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ===== INTEGRATIONS ===== */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <SectionCard title="Connected Services" helper="Manage external integrations and data connections">
                <div className="space-y-3">
                  {integrations.map(i => (
                    <div key={i.name} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Link2 size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{i.name}</p>
                          <p className="text-xs text-muted-foreground">{i.desc}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        i.status === "Connected" ? "bg-primary/10 text-primary" :
                        i.status === "Coming Soon" ? "bg-muted text-muted-foreground" :
                        "bg-warning/10 text-warning"
                      }`}>{i.status}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ===== WORKSPACE ===== */}
          {activeTab === "workspace" && (
            <div className="space-y-6">
              <SectionCard title="Workspace Preferences" helper="Platform-level behavior and formatting">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><FieldLabel>Default Landing Page</FieldLabel>
                    <FieldSelect><option>Dashboard</option><option>Last Project</option><option>Document Upload</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Project Open Behavior</FieldLabel>
                    <FieldSelect><option>Resume last page</option><option>Always open Document Upload</option><option>Always open Scope Analyzer</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Recent Projects Count</FieldLabel>
                    <FieldSelect defaultValue="5"><option>3</option><option>5</option><option>10</option><option>15</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Auto-Save</FieldLabel>
                    <FieldSelect defaultValue="Every 30 seconds"><option>Every 15 seconds</option><option>Every 30 seconds</option><option>Every 60 seconds</option><option>Manual only</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Date Format</FieldLabel>
                    <FieldSelect><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Currency</FieldLabel>
                    <FieldSelect><option>USD ($)</option><option>CAD (C$)</option><option>GBP (£)</option><option>EUR (€)</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Number Format</FieldLabel>
                    <FieldSelect><option>1,000.00</option><option>1.000,00</option><option>1 000.00</option></FieldSelect>
                  </div>
                  <div><FieldLabel>Timezone</FieldLabel>
                    <FieldSelect defaultValue="America/Chicago"><option>America/New_York</option><option>America/Chicago</option><option>America/Denver</option><option>America/Los_Angeles</option></FieldSelect>
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Data Management" helper="Project archival and organization">
                <div className="space-y-2">
                  <Toggle label="Auto-archive projects after 90 days of inactivity" />
                  <Toggle label="Organize files by category on upload" defaultChecked />
                  <Toggle label="Show closed projects on dashboard" />
                </div>
              </SectionCard>
              <Button>Save Workspace Settings</Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
