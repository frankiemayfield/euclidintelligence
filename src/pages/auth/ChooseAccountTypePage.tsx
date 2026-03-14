import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Card, CardContent } from "@/components/ui/card";
import { HardHat, Hammer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChooseAccountTypePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = (track: "subcontractor" | "builder") => {
    // Update user in localStorage
    if (user) {
      const updated = { ...user, accountTrack: track, isFirstRun: true };
      localStorage.setItem("euclid-auth-user", JSON.stringify(updated));
      localStorage.setItem(`euclid-account-${user.email}`, JSON.stringify(updated));
      // Force reload to pick up new state
      window.location.href = track === "subcontractor" ? "/sub/settings" : "/app/settings";
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Choose your account type
          </h1>
          <p className="text-muted-foreground">
            This determines your Euclid experience
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card
            className={cn(
              "cursor-pointer border-2 border-border hover:border-primary/50 transition-all"
            )}
            onClick={() => handleSelect("subcontractor")}
          >
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Hammer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">Subcontractor</p>
                <p className="text-sm text-muted-foreground">Trade-specific quoting, scope analysis, and proposal export</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 border-border hover:border-primary/50 transition-all"
            onClick={() => handleSelect("builder")}
          >
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HardHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">Builder / GC / Developer</p>
                <p className="text-sm text-muted-foreground">Full project estimating, bid leveling, and proposal comparison</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
}
