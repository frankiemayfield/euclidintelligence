import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Card, CardContent } from "@/components/ui/card";
import { HardHat, Hammer, Home } from "lucide-react";

export default function ChooseAccountTypePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = (track: "subcontractor" | "builder" | "homeowner") => {
    if (user) {
      const updated = { ...user, accountTrack: track, isFirstRun: true };
      localStorage.setItem("euclid-auth-user", JSON.stringify(updated));
      localStorage.setItem(`euclid-account-${user.email}`, JSON.stringify(updated));
      const routes: Record<string, string> = { subcontractor: "/sub/settings", homeowner: "/owner", builder: "/app/settings" };
      window.location.href = routes[track];
    }
  };

  const options = [
    { track: "homeowner" as const, icon: Home, label: "Homeowner / Client / Owner", desc: "Compare contractor bids, track invoices, and monitor change orders against your original budget" },
    { track: "subcontractor" as const, icon: Hammer, label: "Subcontractor", desc: "Build estimates faster, reuse pricing memory, and benchmark against similar jobs" },
    { track: "builder" as const, icon: HardHat, label: "Builder / GC / Developer", desc: "Level bids, compare scope, benchmark budgets, and track estimate-to-actual drift" },
  ];

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Choose your account type</h1>
          <p className="text-muted-foreground">This determines your Euclid experience</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {options.map((o) => (
            <Card key={o.track} className="cursor-pointer border-2 border-border hover:border-primary/50 transition-all" onClick={() => handleSelect(o.track)}>
              <CardContent className="flex items-center gap-4 py-5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <o.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">{o.label}</p>
                  <p className="text-sm text-muted-foreground">{o.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
