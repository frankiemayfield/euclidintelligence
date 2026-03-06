import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HardHat, Hammer } from "lucide-react";

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn, demoSignIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      // Routing handled by auth state change in App
      // Check stored account to route correctly
      const stored = localStorage.getItem(`bedrock-account-${email}`);
      if (stored) {
        const account = JSON.parse(stored);
        navigate(account.accountTrack === "subcontractor" ? "/sub" : "/app");
      } else {
        navigate("/choose-account-type");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (track: "sub" | "builder") => {
    demoSignIn(track);
    navigate(track === "sub" ? "/sub" : "/app");
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your Bedrock account
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo accounts */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Quick demo</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1 text-xs"
              onClick={() => handleDemo("sub")}
            >
              <Hammer className="h-4 w-4 text-primary" />
              <span className="font-medium">TrueFrame Carpentry</span>
              <span className="text-muted-foreground">Subcontractor</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1 text-xs"
              onClick={() => handleDemo("builder")}
            >
              <HardHat className="h-4 w-4 text-primary" />
              <span className="font-medium">Mayfield & Co.</span>
              <span className="text-muted-foreground">General Contractor</span>
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
