import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-8">Company profile and estimating defaults</p>

        <div className="space-y-6">
          {/* Company */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display font-semibold text-foreground mb-4">Company Profile</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Company Name</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" defaultValue="Mayfield Construction" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Primary Region</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" defaultValue="Midwest" />
              </div>
            </div>
          </div>

          {/* Defaults */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display font-semibold text-foreground mb-4">Estimating Defaults</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Default Markup</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" defaultValue="10%" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Default Contingency</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" defaultValue="5%" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Tax Rate</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" defaultValue="7.5%" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Default Spec Level</label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option>Mid-Tier</option>
                  <option>Builder Grade</option>
                  <option>Premium</option>
                  <option>Luxury</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display font-semibold text-foreground mb-4">Export & Integration</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">PDF Branding</span>
                <span className="text-xs text-primary font-medium">Configured</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Excel Template</span>
                <span className="text-xs text-primary font-medium">Default</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">ERP / Accounting Sync</span>
                <span className="text-xs text-muted-foreground font-medium">Coming Soon</span>
              </div>
            </div>
          </div>

          <Button>Save Changes</Button>
        </div>
      </div>
    </AppLayout>
  );
}
