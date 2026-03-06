import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, AccountTrack, BuilderSubtype } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardHat, Hammer, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TRADES = [
  "Framing", "Electrical", "Plumbing", "HVAC", "Drywall",
  "Flooring", "Painting", "Concrete", "Roofing", "Other",
];

const BUILDER_SUBTYPES: { value: BuilderSubtype; label: string }[] = [
  { value: "GC", label: "General Contractor" },
  { value: "Builder", label: "Builder" },
  { value: "Remodeler", label: "Remodeler" },
  { value: "Developer", label: "Developer" },
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [accountTrack, setAccountTrack] = useState<AccountTrack | null>(null);
  const [builderSubtype, setBuilderSubtype] = useState<BuilderSubtype | "">("");
  const [primaryTrade, setPrimaryTrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!accountTrack) {
      setError("Please select your account type.");
      return;
    }
    if (accountTrack === "builder" && !builderSubtype) {
      setError("Please select your company type.");
      return;
    }
    if (accountTrack === "subcontractor" && !primaryTrade) {
      setError("Please select your primary trade.");
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email,
        password,
        companyName,
        name: name || undefined,
        region: region || undefined,
        accountTrack,
        builderSubtype: builderSubtype as BuilderSubtype || undefined,
        primaryTrade: accountTrack === "subcontractor" ? primaryTrade : undefined,
      });
      navigate(accountTrack === "subcontractor" ? "/sub/settings" : "/app/settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Start estimating smarter with Bedrock
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account type selection */}
              <div className="space-y-2">
                <Label>I am a…</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setAccountTrack("subcontractor"); setBuilderSubtype(""); }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all text-sm",
                      accountTrack === "subcontractor"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {accountTrack === "subcontractor" && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                    <Hammer className="h-6 w-6 text-primary" />
                    <span className="font-medium text-foreground">Subcontractor</span>
                    <span className="text-xs text-muted-foreground">Trade-specific quoting</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAccountTrack("builder"); setPrimaryTrade(""); }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all text-sm",
                      accountTrack === "builder"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {accountTrack === "builder" && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                    <HardHat className="h-6 w-6 text-primary" />
                    <span className="font-medium text-foreground">Builder / GC</span>
                    <span className="text-xs text-muted-foreground">Full project estimating</span>
                  </button>
                </div>
              </div>

              {/* Builder subtype */}
              {accountTrack === "builder" && (
                <div className="space-y-2">
                  <Label>Company type</Label>
                  <Select value={builderSubtype} onValueChange={(v) => setBuilderSubtype(v as BuilderSubtype)}>
                    <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                    <SelectContent>
                      {BUILDER_SUBTYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Primary trade */}
              {accountTrack === "subcontractor" && (
                <div className="space-y-2">
                  <Label>Primary trade</Label>
                  <Select value={primaryTrade} onValueChange={setPrimaryTrade}>
                    <SelectTrigger><SelectValue placeholder="Select trade…" /></SelectTrigger>
                    <SelectContent>
                      {TRADES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-pw">Password</Label>
                  <Input id="signup-pw" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-pw2">Confirm</Label>
                  <Input id="signup-pw2" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company name</Label>
                <Input id="company" placeholder="Acme Construction" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Name <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="fullname" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="region" placeholder="Pacific NW" value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                No credit card required for demo
              </p>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
