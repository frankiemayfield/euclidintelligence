import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, AccountTrack, BuilderSubtype } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardHat, Hammer, Home, Check } from "lucide-react";
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

const ACCOUNT_TYPES: { value: AccountTrack; label: string; icon: typeof Home; desc: string }[] = [
  { value: "homeowner", label: "Homeowner", icon: Home, desc: "Compare bids, track invoices, monitor change orders" },
  { value: "subcontractor", label: "Subcontractor", icon: Hammer, desc: "Build estimates, reuse pricing, benchmark jobs" },
  { value: "builder", label: "Builder / GC", icon: HardHat, desc: "Level bids, compare scope, benchmark budgets" },
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, demoSignIn } = useAuth();

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

    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!accountTrack) { setError("Please select your account type."); return; }
    if (accountTrack === "builder" && !builderSubtype) { setError("Please select your company type."); return; }
    if (accountTrack === "subcontractor" && !primaryTrade) { setError("Please select your primary trade."); return; }

    setLoading(true);
    try {
      await signUp({
        email, password,
        companyName: accountTrack === "homeowner" ? name || "—" : companyName,
        name: name || undefined,
        region: region || undefined,
        accountTrack,
        builderSubtype: builderSubtype as BuilderSubtype || undefined,
        primaryTrade: accountTrack === "subcontractor" ? primaryTrade : undefined,
      });
      const routes: Record<string, string> = { subcontractor: "/sub/settings", homeowner: "/owner", builder: "/app/settings" };
      navigate(routes[accountTrack] || "/app/settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (track: "sub" | "builder" | "homeowner") => {
    demoSignIn(track);
    const routes = { sub: "/sub", builder: "/app", homeowner: "/owner" };
    navigate(routes[track]);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="text-muted-foreground">Start using Euclid Intelligence</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account type selection — 3 options */}
              <div className="space-y-2">
                <Label>I am a…</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOUNT_TYPES.map((at) => (
                    <button key={at.value} type="button"
                      onClick={() => { setAccountTrack(at.value); setBuilderSubtype(""); setPrimaryTrade(""); }}
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-xs",
                        accountTrack === at.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      {accountTrack === at.value && <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />}
                      <at.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{at.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">{at.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {accountTrack === "builder" && (
                <div className="space-y-2">
                  <Label>Company type</Label>
                  <Select value={builderSubtype} onValueChange={(v) => setBuilderSubtype(v as BuilderSubtype)}>
                    <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                    <SelectContent>{BUILDER_SUBTYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {accountTrack === "subcontractor" && (
                <div className="space-y-2">
                  <Label>Primary trade</Label>
                  <Select value={primaryTrade} onValueChange={setPrimaryTrade}>
                    <SelectTrigger><SelectValue placeholder="Select trade…" /></SelectTrigger>
                    <SelectContent>{TRADES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

              {accountTrack !== "homeowner" && (
                <div className="space-y-2">
                  <Label htmlFor="company">Company name</Label>
                  <Input id="company" placeholder="Acme Construction" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Name {accountTrack !== "homeowner" && <span className="text-muted-foreground">(optional)</span>}</Label>
                  <Input id="fullname" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required={accountTrack === "homeowner"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="region" placeholder="Pacific NW" value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Portals */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Explore Demo Portals</span>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm" className="h-auto py-3 flex items-center gap-3 justify-start text-left" onClick={() => handleDemo("homeowner")}>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Home className="h-4 w-4 text-primary" /></div>
              <div>
                <span className="font-medium text-foreground text-sm">Demo Homeowner Portal — Andrew Osterfeld</span>
                <p className="text-[11px] text-muted-foreground">Proposal comparison, leveling, budget tracking</p>
              </div>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-1 text-xs" onClick={() => handleDemo("sub")}>
                <Hammer className="h-4 w-4 text-primary" /><span className="font-medium">TrueFrame Carpentry</span><span className="text-muted-foreground">Subcontractor</span>
              </Button>
              <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-1 text-xs" onClick={() => handleDemo("builder")}>
                <HardHat className="h-4 w-4 text-primary" /><span className="font-medium">Mayfield & Co.</span><span className="text-muted-foreground">General Contractor</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
