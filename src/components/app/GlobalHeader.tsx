import { Bell, ChevronDown, MessageSquare, Settings, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type Track = "builder" | "sub" | "owner";

const trackConfig = {
  builder: {
    dashboard: "/app",
    precon: "/app/upload",
    active: "/app/est-vs-actual",
    settings: "/app/settings",
    company: "Mayfield & Co.",
    initials: "SC",
    person: "Sarah Chen",
    role: "General Contractor",
  },
  sub: {
    dashboard: "/sub",
    precon: "/sub/upload",
    active: "/sub/est-vs-actual",
    settings: "/sub/settings",
    company: "TrueFrame Carpentry",
    initials: "AR",
    person: "Alex Rivera",
    role: "Subcontractor",
  },
  owner: {
    dashboard: "/owner",
    precon: "/owner/upload",
    active: "/owner/documents",
    settings: "/owner/settings",
    company: "Osterfeld Residence",
    initials: "AO",
    person: "Andrew Osterfeld",
    role: "Homeowner",
  },
} as const;

const notifications = [
  { title: "Scope review needs attention", detail: "Maple St. Kitchen Remodel · 4 items", time: "12m", tone: "warning" },
  { title: "Bid package received", detail: "Spark Electric submitted Division 26", time: "1h", tone: "info" },
  { title: "Proposal ready to send", detail: "Oakwood Custom Home", time: "3h", tone: "success" },
];

function sectionFor(path: string, config: (typeof trackConfig)[Track]) {
  if (path === config.dashboard || path === `${config.dashboard}/`) return "dashboard";
  if (path === config.settings) return "settings";
  if (path === config.active) return "active";
  return "precon";
}

export function GlobalHeader({ track }: { track: Track }) {
  const config = trackConfig[track];
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const section = sectionFor(location.pathname, config);
  const navItems = [
    { id: "dashboard", label: "Dashboard", to: config.dashboard },
    { id: "precon", label: "Pre-Construction", to: config.precon },
    { id: "active", label: "Active Projects", to: config.active },
    { id: "settings", label: "Settings", to: config.settings },
  ];

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  return (
    <header className="odyssey-header relative z-50 mx-3 mt-3 flex h-[68px] shrink-0 items-center justify-between px-5 lg:mx-5 lg:px-7">
      <Link to={config.dashboard} className="min-w-0 shrink-0" aria-label="Euclid dashboard">
        <span className="font-display text-lg font-semibold uppercase text-foreground [letter-spacing:.28em]">Euclid</span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-card/45 p-1 shadow-sm backdrop-blur-xl md:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-card/60 hover:text-foreground lg:px-5",
              section === item.id && "bg-foreground text-background shadow-sm hover:bg-foreground hover:text-background",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="hidden h-9 w-9 rounded-full sm:inline-flex" aria-label="Messages">
          <MessageSquare size={16} />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full"
            aria-label="Notifications"
            onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }}
          >
            <Bell size={16} />
            <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          </Button>
          {notificationsOpen && (
            <div className="odyssey-popover absolute right-0 top-12 w-[min(360px,calc(100vw-2rem))] overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">Notifications</p>
                  <p className="text-[11px] text-muted-foreground">Three updates need review</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={14} /></Button>
              </div>
              <div className="flex gap-1 border-b border-border/50 px-4 py-2">
                <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold text-background">All</span>
                <span className="rounded-full px-3 py-1 text-[10px] font-semibold text-muted-foreground">Unread</span>
              </div>
              <div className="divide-y divide-border/50">
                {notifications.map((item) => (
                  <button key={item.title} className="flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-card/60">
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.tone === "warning" ? "bg-warning" : item.tone === "success" ? "bg-success" : "bg-info")} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-foreground">{item.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.detail}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </button>
                ))}
              </div>
              <Link to={config.dashboard} className="block border-t border-border/60 px-5 py-3 text-center text-[11px] font-semibold text-primary" onClick={() => setNotificationsOpen(false)}>View activity</Link>
            </div>
          )}
        </div>
        <div className="mx-1 hidden h-6 w-px bg-border/70 sm:block" />
        <div className="relative">
          <Button variant="ghost" className="h-10 rounded-full px-1.5 sm:pr-2.5" onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false); }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{config.initials}</span>
            <span className="hidden max-w-28 truncate text-xs font-semibold text-foreground lg:inline">{config.person.split(" ")[0]}</span>
            <ChevronDown size={13} className="hidden text-muted-foreground lg:block" />
          </Button>
          {profileOpen && (
            <div className="odyssey-popover absolute right-0 top-12 w-64 p-2">
              <div className="border-b border-border/60 px-3 py-3">
                <p className="text-sm font-semibold text-foreground">{config.person}</p>
                <p className="text-[11px] text-muted-foreground">{config.company} · {config.role}</p>
              </div>
              <Link to={config.settings} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={() => setProfileOpen(false)}><UserRound size={14} /> Profile</Link>
              <Link to={config.settings} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={() => setProfileOpen(false)}><Settings size={14} /> Settings</Link>
              <Button variant="ghost" className="mt-1 h-9 w-full justify-start rounded-lg px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleSignOut}>Sign out</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}