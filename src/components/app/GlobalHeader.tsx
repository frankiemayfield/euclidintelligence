import { Bell, Building2, ChevronDown, CheckCheck, MessageSquare, Settings, ShieldCheck, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
function sectionFor(path: string, config: (typeof trackConfig)[Track]) {
  if (path === config.dashboard || path === `${config.dashboard}/`) return "dashboard";
  if (path.startsWith("/activity")) return "activity";
  if (path.startsWith(config.financials)) return "financials";
  if (path === config.settings || path.startsWith("/network") || path.startsWith("/compliance")) return "more";
  if (path.startsWith(config.active) || path.startsWith(config.schedule) || path.startsWith(config.time) || path.startsWith(config.projects) || path.includes("/projects") || path.endsWith("/operations")) return "operations";
  return "financials";
}

export function GlobalHeader({ track }: { track: Track }) {
  const config = trackConfig[track]; const location = useLocation(); const navigate = useNavigate(); const { signOut } = useAuth();
  const { setProjectId } = useDemoProject();
  const notices = track === "owner" ? [] : notificationsByTrack[track];
  const [notificationsOpen,setNotificationsOpen]=useState(false); const [profileOpen,setProfileOpen]=useState(false); const [messengerOpen,setMessengerOpen]=useState(false); const [noticeFilter,setNoticeFilter]=useState<"all"|"unread">("all"); const [moreOpen,setMoreOpen]=useState(false);
  const section=sectionFor(location.pathname,config);
  const closeAll=()=>{setMoreOpen(false);setNotificationsOpen(false);setProfileOpen(false);setMessengerOpen(false)};
  const moreItems=[{label:"Network",to:"/network",icon:Building2},{label:"Compliance",to:"/compliance",icon:ShieldCheck}];
  return <>
    <header className="odyssey-header relative z-[70] flex h-[76px] shrink-0 items-center justify-between px-6 lg:px-[7%]">
      <Link to={config.dashboard} aria-label="Euclid dashboard" className="flex h-full items-center"><EuclidWordmark /></Link>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Primary navigation">
        <Link to={config.dashboard} data-active={section==="dashboard"} onClick={closeAll} className="odyssey-nav-link rounded-full border border-transparent px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Home</Link>
        <Link to="/activity" data-active={section==="activity"} onClick={closeAll} className="odyssey-nav-link rounded-full border border-transparent px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Activity</Link>
        <Link to={config.projects} data-active={section==="operations"} onClick={closeAll} className="odyssey-nav-link rounded-full border border-transparent px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Operations</Link>
        <Link to={config.financials} data-active={section==="financials"} onClick={closeAll} className="odyssey-nav-link rounded-full border border-transparent px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Financials</Link>
        <div className="relative">
          <button data-active={section==="more"} onClick={()=>{const next=!moreOpen;closeAll();setMoreOpen(next)}} className="odyssey-nav-link flex items-center gap-1 rounded-full border border-transparent px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">More <ChevronDown size={13}/></button>
          {moreOpen&&<div className="odyssey-popover absolute left-1/2 top-11 z-[100] w-56 -translate-x-1/2 p-2">
            {moreItems.map(item=><Link key={item.to} to={item.to} onClick={()=>setMoreOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground"><item.icon size={14}/>{item.label}</Link>)}
            <div className="my-1 h-px bg-border/60"/>
            <Link to={config.settings} onClick={()=>setMoreOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground"><Settings size={14}/>Settings</Link>
          </div>}
        </div>
      </nav>
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className={cn("odyssey-header-control relative h-9 w-9",messengerOpen&&"is-active")} aria-label="Messages" onClick={()=>{setMessengerOpen(v=>!v);setNotificationsOpen(false);setProfileOpen(false)}}><MessageSquare strokeWidth={1.6}/><span className="odyssey-counter bg-destructive text-destructive-foreground">3</span></Button>
        <div className="relative"><Button variant="ghost" size="icon" className={cn("odyssey-header-control relative h-9 w-9",notificationsOpen&&"is-active")} aria-label="Notifications" onClick={()=>{setNotificationsOpen(v=>!v);setProfileOpen(false);setMessengerOpen(false)}}><Bell strokeWidth={1.6}/><span className="odyssey-counter bg-primary text-primary-foreground">{notices.length}</span></Button>
          {notificationsOpen&&<div className="odyssey-popover fixed right-[4%] top-[84px] z-[100] flex max-h-[calc(100vh-104px)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden lg:right-[9%]">
             <div className="flex items-center justify-between px-4 py-4"><div className="flex items-center gap-2"><p className="font-display text-base font-bold">Notifications</p><span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{notices.length}</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-8 px-2 text-[10px]"><CheckCheck size={13}/>Mark all read</Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>setNotificationsOpen(false)}><X size={14}/></Button></div></div>
            <div className="mx-4 grid grid-cols-2 rounded-full bg-muted/70 p-1">{(["all","unread"] as const).map(f=><button key={f} onClick={()=>setNoticeFilter(f)} className={cn("rounded-full py-1.5 text-[10px] font-semibold capitalize",noticeFilter===f&&"bg-card text-foreground shadow-sm")}>{f}{f==="unread"&&" (3)"}</button>)}</div>
            <div className="mt-3 flex gap-1 overflow-x-auto border-b border-border/60 px-4 pb-2">{["All","Messages","Scope","Attention","Financial"].map((f,i)=><span key={f} className={cn("shrink-0 rounded-full px-2.5 py-1 text-[9px]",i===0?"bg-primary/10 text-primary":"bg-card/40 text-muted-foreground")}>{f}</span>)}</div>
             <div className="overflow-y-auto"><p className="px-4 pb-1 pt-3 text-[9px] font-bold uppercase text-muted-foreground">Today</p>{notices.map(n=><button key={n.id} onClick={()=>{setProjectId(n.projectId);navigate(n.route);setNotificationsOpen(false)}} className="flex w-full gap-3 border-b border-border/45 px-4 py-3 text-left hover:bg-card/55"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full",n.tone==="warning"?"bg-warning":"bg-info")}/><span className="min-w-0 flex-1"><span className="block text-xs font-semibold leading-snug">{n.title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{n.detail}</span><span className="mt-2 block text-[10px] font-semibold text-primary">Open project</span></span></button>)}</div>
            <Link to={config.dashboard} className="border-t border-border/60 px-4 py-3 text-center text-[10px] font-semibold text-primary" onClick={()=>setNotificationsOpen(false)}>View all activity</Link>
          </div>}
        </div>
        <Link to={config.settings} className="hidden sm:block"><Button variant="ghost" size="icon" className="odyssey-header-control h-9 w-9" aria-label="Settings"><Settings strokeWidth={1.6}/></Button></Link>
        <div className="ml-2 hidden h-5 w-px bg-border/60 sm:block"/><div className="relative"><Button variant="ghost" className="h-10 px-1.5 sm:pr-2" onClick={()=>{setProfileOpen(v=>!v);setNotificationsOpen(false);setMessengerOpen(false)}}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{config.initials}</span><span className="hidden text-[13px] font-semibold lg:inline">{config.person.split(" ")[0]}</span><ChevronDown size={13} className="hidden text-muted-foreground lg:block"/></Button>{profileOpen&&<div className="odyssey-popover absolute right-0 top-12 z-[100] w-64 p-2"><div className="border-b border-border/60 px-3 py-3"><p className="text-sm font-semibold">{config.person}</p><p className="text-[10px] text-muted-foreground">{config.company} · {config.role}</p></div><Link to={config.settings} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={()=>setProfileOpen(false)}><UserRound size={14}/>Profile & preferences</Link><Link to={config.settings} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={()=>setProfileOpen(false)}><Settings size={14}/>Workspace settings</Link><Button variant="ghost" className="mt-1 h-9 w-full justify-start rounded-lg px-3 text-xs text-destructive" onClick={()=>{signOut();navigate("/signin")}}>Sign out</Button></div>}</div>
      </div>
    </header>
    <MessengerDropdown open={messengerOpen} onClose={()=>setMessengerOpen(false)}/>
  </>;
}
