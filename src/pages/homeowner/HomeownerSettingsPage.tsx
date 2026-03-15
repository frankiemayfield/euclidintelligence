import { HomeownerLayout } from "@/components/homeowner/HomeownerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { homeowner } from "@/data/homeownerData";

export default function HomeownerSettingsPage() {
  return (
    <HomeownerLayout>
      <div className="p-6 space-y-6 max-w-[900px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Account and project preferences</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Name</p><p className="text-foreground font-medium">{homeowner.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Email</p><p className="text-foreground font-medium">{homeowner.email}</p></div>
              <div><p className="text-muted-foreground text-xs">Phone</p><p className="text-foreground font-medium">{homeowner.phone}</p></div>
              <div><p className="text-muted-foreground text-xs">Account Type</p><Badge variant="outline" className="text-[10px]">Homeowner</Badge></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Project Name</p><p className="text-foreground font-medium">{homeowner.projectName}</p></div>
              <div><p className="text-muted-foreground text-xs">Location</p><p className="text-foreground font-medium">{homeowner.location}</p></div>
              <div><p className="text-muted-foreground text-xs">Project Type</p><p className="text-foreground font-medium">{homeowner.projectType}</p></div>
              <div><p className="text-muted-foreground text-xs">Phase</p><Badge variant="outline" className="text-[10px]">{homeowner.phase}</Badge></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {["Invoice submitted", "Change order received", "Budget threshold exceeded", "Document uploaded"].map(n => (
                <div key={n} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-foreground">{n}</span>
                  <Badge variant="outline" className="text-[10px]">Email</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeownerLayout>
  );
}
