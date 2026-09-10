import { Bell, ChevronDown, CheckCheck, MessageSquare, Settings, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { EuclidWordmark } from "./EuclidBrand";
import { MessengerDropdown } from "./ConstructionMessenger";
import { companies, notificationsByTrack, people } from "@/data/demoUniverse";
import { useDemoProject } from "@/hooks/use-demo-project";

type Track = "builder" | "sub" | "owner";
const trackConfig = {
  builder: { dashboard: "/app", projects: "/app/operations", precon: "/app/upload", newProject: "/app/new-project", preconLabel: "Preconstruction", activeLabel: "Active Projects", active: "/app/active", schedule: "/app/schedule", time: "/app/time", financials: "/app/financials", settings: "/app/settings", company: companies.mayfield.name, initials: people.frankie.initials, person: people.frankie.name, role: people.frankie.title },
  sub: { dashboard: "/sub", projects: "/sub/operations", precon: "/sub/upload", newProject: "/sub/upload", preconLabel: "Preconstruction", activeLabel: "Active Jobs", active: "/sub/active", schedule: "/sub/schedule", time: "/sub/time", financials: "/sub/financials", settings: "/sub/settings", company: companies.trueframe.name, initials: people.tyler.initials, person: people.tyler.name, role: people.tyler.title },
  owner: { dashboard: "/owner", projects: "/owner/documents", precon: "/owner/upload", newProject: "/owner/upload", preconLabel: "Preconstruction", activeLabel: "Active Projects", active: "/owner/documents", schedule: "/owner/documents", time: "/owner/documents", financials: "/owner/budget", settings: "/owner/settings", company: "Osterfeld Residence", initials: "AO", person: "Andrew Osterfeld", role: "Homeowner" },
} as const;

const PRECON_PATHS = ["/precon", "/upload", "/scope-analyzer", "/bid-leveling", "/estimate-builder", "/pricing", "/proposal", "/estimate-comparison", "/market-comparison", "/proposal-comparison", "/est-vs-actual", "/new-project", "/preconstruction", "/financials/preconstruction"];
const OPERATIONS_PATHS = ["/operations", "/projects", "/active", "/schedule", "/time"];

function sectionFor(path: string, base: string, config: (typeof trackConfig)[Track]) {
  if (path === config.dashboard || path === `${config.dashboard}/`) return "dashboard";
  if (path.startsWith(`${base}/projects`)) return "projects";
  if (path.startsWith("/activity")) return "more";
  if (path === config.settings || path.startsWith("/network") || path.startsWith("/compliance")) return "more";
  if (PRECON_PATHS.some(p => path.startsWith(`${base}${p}`))) return "precon";
  if (OPERATIONS_PATHS.some(p => path.startsWith(`${base}${p}`))) return "operations";
  if (path.startsWith(config.financials)) return "financials";
  return "dashboard";
}

type PillarItem = { label: string; to: string; divider?: boolean };

function Pillar({ id, label, to, items, section, open, setOpen }: {
  id: string; label: string; to: string; items: PillarItem[]; section: string;
  open: string | null; setOpen: (v: string | null) => void;
}) {
  const isOpen = open === id;
  const isActive = section === id;
  return (
    <div
      className="relative after:absolute after:left-0 after:top-full after:h-3 after:w-full"
      onMouseEnter={() => setOpen(id)}
      onMouseLeave={() => setOpen(null)}
      onFocus={() => setOpen(id)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(null);
      }}
    >
      <Link
        to={to}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-active={isActive}
        data-open={isOpen}
        onClick={() => setOpen(null)}
        className="odyssey-nav-group block px-4 py-2 text-[14px] font-medium leading-6 text-muted-foreground transition-colors hover:text-foreground"
      >{label}</Link>
      {isOpen && (
        <div role="menu" className="odyssey-popover odyssey-menu absolute left-1/2 top-11 z-[100] w-56 -translate-x-1/2 p-2">
          {items.map(item => (
            <div key={item.to + item.label}>
              {item.divider && <div className="my-1 h-px bg-border/60" />}
              <Link to={item.to} onClick={() => setOpen(null)}
                className="block rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground">{item.label}</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GlobalHeader({ track }: { track: Track }) {
  const config = trackConfig[track]; const location = useLocation(); const navigate = useNavigate(); const { signOut } = useAuth();
  const { setProjectId } = useDemoProject();
  const notices = track === "owner" ? [] : notificationsByTrack[track];
  const [notificationsOpen,setNotificationsOpen]=useState(false); const [profileOpen,setProfileOpen]=useState(false); const [messengerOpen,setMessengerOpen]=useState(false); const [noticeFilter,setNoticeFilter]=useState<"all"|"unread">("all"); const [openPillar,setOpenPillar]=useState<string|null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const base = track === "sub" ? "/sub" : track === "owner" ? "/owner" : "/app";
  const section=sectionFor(location.pathname,base,config);
  const closeAll=()=>{setOpenPillar(null);setNotificationsOpen(false);setProfileOpen(false);setMessengerOpen(false)};
  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAll();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  const pillars: { id: string; label: string; to: string; items: PillarItem[] }[] = track === "owner" ? [] : [
    { id: "precon", label: "Precon", to: `${base}/precon`, items: [
      { label: "Overview", to: `${base}/precon` },
      { label: "Estimator", to: `${base}/precon/estimator` },
      { label: "Market Outlook", to: `${base}/precon/market-outlook` },
    ] },
    { id: "operations", label: "Operations", to: `${base}/operations`, items: [
      { label: "Overview", to: `${base}/operations` },
      { label: "Schedule", to: `${base}/schedule` },
      { label: "Time Clock", to: `${base}/time` },
    ] },
    { id: "financials", label: "Financials", to: `${base}/financials`, items: [
      { label: "Overview", to: `${base}/financials` },
      { label: "Cost Inbox", to: `${base}/financials/inbox` },
      { label: "Budget", to: `${base}/financials/tool/budget`, divider: true },
      { label: "Costs", to: `${base}/financials/tool/costs` },
      { label: "Commitments", to: `${base}/financials/tool/commitments` },
      { label: "Change Orders", to: `${base}/financials/tool/changes` },
      { label: "Client Billing", to: `${base}/financials/tool/billing` },
    ] },
    { id: "more", label: "More", to: "/activity", items: [
      { label: "Activity", to: "/activity" },
      { label: "Network", to: "/network" },
      { label: "Compliance", to: "/compliance" },
      { label: "Settings", to: config.settings, divider: true },
    ] },
  ];
  return <div ref={headerRef} className="contents">
    <header className="odyssey-header relative z-[70] h-[76px] shrink-0">
      <div className="app-shell relative flex h-full items-center justify-between">
      <Link to={config.dashboard} aria-label="Euclid dashboard" onClick={closeAll} className="flex h-full items-center"><EuclidWordmark className="h-12 w-[168px]" /></Link>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex" aria-label="Primary navigation">
        <Link to={config.dashboard} data-active={section==="dashboard"} onClick={closeAll} className="odyssey-nav-link rounded-full border border-transparent px-4 py-2 text-[14px] font-medium leading-6 text-muted-foreground transition-colors hover:text-foreground">Home</Link>
        {track !== "owner" && <Link to={`${base}/projects`} data-active={section==="projects"} onClick={closeAll} className="odyssey-nav-link rounded-full border border-transparent px-4 py-2 text-[14px] font-medium leading-6 text-muted-foreground transition-colors hover:text-foreground">Projects</Link>}
        {pillars.map(p => <Pillar key={p.id} {...p} section={section} open={openPillar} setOpen={setOpenPillar} />)}
      </nav>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className={cn("odyssey-header-control relative h-10 w-10 [&_svg]:size-[18px]",messengerOpen&&"is-active")} aria-label="Messages" onClick={()=>{setMessengerOpen(v=>!v);setNotificationsOpen(false);setProfileOpen(false)}}><MessageSquare strokeWidth={1.6}/><span className="odyssey-counter bg-destructive text-destructive-foreground">3</span></Button>
        <div className="relative"><Button variant="ghost" size="icon" className={cn("odyssey-header-control relative h-10 w-10 [&_svg]:size-[18px]",notificationsOpen&&"is-active")} aria-label="Notifications" onClick={()=>{setNotificationsOpen(v=>!v);setProfileOpen(false);setMessengerOpen(false)}}><Bell strokeWidth={1.6}/><span className="odyssey-counter bg-primary text-primary-foreground">{notices.length}</span></Button>

          {notificationsOpen&&<div className="odyssey-popover fixed right-[4%] top-[84px] z-[100] flex max-h-[calc(100vh-104px)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden lg:right-[9%]">
             <div className="flex items-center justify-between px-4 py-4"><div className="flex items-center gap-2"><p className="font-display text-base font-bold">Notifications</p><span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{notices.length}</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-8 px-2 text-[10px]"><CheckCheck size={13}/>Mark all read</Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>setNotificationsOpen(false)}><X size={14}/></Button></div></div>
            <div className="mx-4 grid grid-cols-2 rounded-full bg-muted/70 p-1">{(["all","unread"] as const).map(f=><button key={f} onClick={()=>setNoticeFilter(f)} className={cn("rounded-full py-1.5 text-[10px] font-semibold capitalize",noticeFilter===f&&"bg-card text-foreground shadow-sm")}>{f}{f==="unread"&&" (3)"}</button>)}</div>
            <div className="mt-3 flex gap-1 overflow-x-auto border-b border-border/60 px-4 pb-2">{["All","Messages","Scope","Attention","Financial"].map((f,i)=><span key={f} className={cn("shrink-0 rounded-full px-2.5 py-1 text-[9px]",i===0?"bg-primary/10 text-primary":"bg-card/40 text-muted-foreground")}>{f}</span>)}</div>
             <div className="overflow-y-auto"><p className="px-4 pb-1 pt-3 text-[9px] font-bold uppercase text-muted-foreground">Today</p>{notices.map(n=><button key={n.id} onClick={()=>{setProjectId(n.projectId);navigate(n.route);setNotificationsOpen(false)}} className="flex w-full gap-3 border-b border-border/45 px-4 py-3 text-left hover:bg-card/55"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full",n.tone==="warning"?"bg-warning":"bg-info")}/><span className="min-w-0 flex-1"><span className="block text-xs font-semibold leading-snug">{n.title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{n.detail}</span><span className="mt-2 block text-[10px] font-semibold text-primary">Open project</span></span></button>)}</div>
            <Link to={config.dashboard} className="border-t border-border/60 px-4 py-3 text-center text-[10px] font-semibold text-primary" onClick={()=>setNotificationsOpen(false)}>View all activity</Link>
          </div>}
        </div>
        <Link to={config.settings} className="hidden sm:block"><Button variant="ghost" size="icon" className="odyssey-header-control h-10 w-10 [&_svg]:size-[18px]" aria-label="Settings"><Settings strokeWidth={1.6}/></Button></Link>
        <div className="ml-2 hidden h-6 w-px bg-border/60 sm:block"/><div className="relative"><Button variant="ghost" className="h-11 gap-2 px-1.5 sm:pr-2.5" onClick={()=>{setProfileOpen(v=>!v);setNotificationsOpen(false);setMessengerOpen(false)}}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{config.initials}</span><span className="hidden text-[14px] font-semibold lg:inline">{config.person.split(" ")[0]}</span><ChevronDown size={15} className="hidden text-muted-foreground lg:block"/></Button>{profileOpen&&<div className="odyssey-popover absolute right-0 top-12 z-[100] w-64 p-2"><div className="border-b border-border/60 px-3 py-3"><p className="text-sm font-semibold">{config.person}</p><p className="text-[10px] text-muted-foreground">{config.company} · {config.role}</p></div><Link to={config.settings} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={()=>setProfileOpen(false)}><UserRound size={14}/>Profile & preferences</Link><Link to={config.settings} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={()=>setProfileOpen(false)}><Settings size={14}/>Workspace settings</Link><Button variant="ghost" className="mt-1 h-9 w-full justify-start rounded-lg px-3 text-xs text-destructive" onClick={()=>{signOut();navigate("/signin")}}>Sign out</Button></div>}</div>

      </div>
      </div>
    </header>
    <MessengerDropdown open={messengerOpen} onClose={()=>setMessengerOpen(false)}/>
  </div>;
}
