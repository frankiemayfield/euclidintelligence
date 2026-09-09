import { Bell, ChevronDown, CheckCheck, MessageSquare, Settings, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { EuclidWordmark } from "./EuclidBrand";
import { ConstructionMessenger } from "./ConstructionMessenger";

type Track = "builder" | "sub" | "owner";
const trackConfig = {
  builder: { dashboard: "/app", precon: "/app/upload", active: "/app/est-vs-actual", settings: "/app/settings", company: "Mayfield & Co.", initials: "SC", person: "Sarah Chen", role: "General Contractor" },
  sub: { dashboard: "/sub", precon: "/sub/upload", active: "/sub/est-vs-actual", settings: "/sub/settings", company: "TrueFrame Carpentry", initials: "AR", person: "Alex Rivera", role: "Subcontractor" },
  owner: { dashboard: "/owner", precon: "/owner/upload", active: "/owner/documents", settings: "/owner/settings", company: "Osterfeld Residence", initials: "AO", person: "Andrew Osterfeld", role: "Homeowner" },
} as const;
const notices = [
  { title: "Acknowledgment required — Division 26 revised", detail: "Ryan Mitchell asked you to confirm scope receipt", time: "just now", tone: "warning", action: "Acknowledge" },
  { title: "Bid package received", detail: "Spark Electric submitted electrical pricing", time: "18m", tone: "info", action: "Open package" },
  { title: "Sarah mentioned you in #maple-st-kitchen", detail: "Can you confirm the lighting allowance?", time: "1h", tone: "success", action: "Open message" },
];
function sectionFor(path: string, config: (typeof trackConfig)[Track]) { if (path === config.dashboard || path === `${config.dashboard}/`) return "dashboard"; if (path === config.settings) return "settings"; if (path === config.active) return "active"; return "precon"; }

export function GlobalHeader({ track }: { track: Track }) {
  const config = trackConfig[track]; const location = useLocation(); const navigate = useNavigate(); const { signOut } = useAuth();
  const [notificationsOpen,setNotificationsOpen]=useState(false); const [profileOpen,setProfileOpen]=useState(false); const [messengerOpen,setMessengerOpen]=useState(false); const [noticeFilter,setNoticeFilter]=useState<"all"|"unread">("all");
  const section=sectionFor(location.pathname,config);
  const navItems=[{id:"dashboard",label:"Home",to:config.dashboard},{id:"precon",label:"Pre-Construction",to:config.precon},{id:"active",label:"Active Projects",to:config.active},{id:"settings",label:"Settings",to:config.settings}];
  return <>
    <header className="odyssey-header relative z-[70] flex h-[72px] shrink-0 items-center justify-between px-7 lg:px-[9%]">
      <Link to={config.dashboard} aria-label="Euclid dashboard" className="flex h-full items-center"><EuclidWordmark className="h-auto w-[132px]"/></Link>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Primary navigation">{navItems.map(item=><Link key={item.id} to={item.to} className={cn("rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",section===item.id&&"bg-card/70 text-foreground shadow-sm backdrop-blur-md")}>{item.label}</Link>)}</nav>
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className={cn("odyssey-header-control relative h-9 w-9",messengerOpen&&"is-active")} aria-label="Messages" onClick={()=>{setMessengerOpen(v=>!v);setNotificationsOpen(false);setProfileOpen(false)}}><MessageSquare strokeWidth={1.6}/><span className="odyssey-counter bg-destructive text-destructive-foreground">3</span></Button>
        <div className="relative"><Button variant="ghost" size="icon" className={cn("odyssey-header-control relative h-9 w-9",notificationsOpen&&"is-active")} aria-label="Notifications" onClick={()=>{setNotificationsOpen(v=>!v);setProfileOpen(false);setMessengerOpen(false)}}><Bell strokeWidth={1.6}/><span className="odyssey-counter bg-primary text-primary-foreground">3</span></Button>
          {notificationsOpen&&<div className="odyssey-popover fixed right-5 top-[84px] z-[100] flex max-h-[calc(100vh-104px)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4"><div className="flex items-center gap-2"><p className="font-display text-base font-bold">Notifications</p><span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">3</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-8 px-2 text-[10px]"><CheckCheck size={13}/>Mark all read</Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>setNotificationsOpen(false)}><X size={14}/></Button></div></div>
            <div className="mx-4 grid grid-cols-2 rounded-full bg-muted/70 p-1">{(["all","unread"] as const).map(f=><button key={f} onClick={()=>setNoticeFilter(f)} className={cn("rounded-full py-1.5 text-[10px] font-semibold capitalize",noticeFilter===f&&"bg-card text-foreground shadow-sm")}>{f}{f==="unread"&&" (3)"}</button>)}</div>
            <div className="mt-3 flex gap-1 overflow-x-auto border-b border-border/60 px-4 pb-2">{["All","Messages","Scope","Attention","Financial"].map((f,i)=><span key={f} className={cn("shrink-0 rounded-full px-2.5 py-1 text-[9px]",i===0?"bg-primary/10 text-primary":"bg-card/40 text-muted-foreground")}>{f}</span>)}</div>
            <div className="overflow-y-auto"><p className="px-4 pb-1 pt-3 text-[9px] font-bold uppercase text-muted-foreground">Today</p>{notices.map(n=><button key={n.title} className="flex w-full gap-3 border-b border-border/45 px-4 py-3 text-left hover:bg-card/55"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full",n.tone==="warning"?"bg-warning":n.tone==="success"?"bg-success":"bg-info")}/><span className="min-w-0 flex-1"><span className="block text-xs font-semibold leading-snug">{n.title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{n.detail}</span><span className="mt-2 block text-[10px] font-semibold text-primary">{n.action}</span></span><span className="shrink-0 text-[9px] text-muted-foreground">{n.time}</span></button>)}</div>
            <Link to={config.dashboard} className="border-t border-border/60 px-4 py-3 text-center text-[10px] font-semibold text-primary" onClick={()=>setNotificationsOpen(false)}>View all activity</Link>
          </div>}
        </div>
        <Link to={config.settings} className="hidden sm:block"><Button variant="ghost" size="icon" className="odyssey-header-control h-9 w-9" aria-label="Settings"><Settings strokeWidth={1.6}/></Button></Link>
        <div className="ml-2 hidden h-5 w-px bg-border/60 sm:block"/><div className="relative"><Button variant="ghost" className="h-10 px-1.5 sm:pr-2" onClick={()=>{setProfileOpen(v=>!v);setNotificationsOpen(false);setMessengerOpen(false)}}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{config.initials}</span><span className="hidden text-[13px] font-semibold lg:inline">{config.person.split(" ")[0]}</span><ChevronDown size={13} className="hidden text-muted-foreground lg:block"/></Button>{profileOpen&&<div className="odyssey-popover absolute right-0 top-12 z-[100] w-64 p-2"><div className="border-b border-border/60 px-3 py-3"><p className="text-sm font-semibold">{config.person}</p><p className="text-[10px] text-muted-foreground">{config.company} · {config.role}</p></div><Link to={config.settings} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={()=>setProfileOpen(false)}><UserRound size={14}/>Profile & preferences</Link><Link to={config.settings} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground" onClick={()=>setProfileOpen(false)}><Settings size={14}/>Workspace settings</Link><Button variant="ghost" className="mt-1 h-9 w-full justify-start rounded-lg px-3 text-xs text-destructive" onClick={()=>{signOut();navigate("/signin")}}>Sign out</Button></div>}</div>
      </div>
    </header>
    <ConstructionMessenger open={messengerOpen} onClose={()=>setMessengerOpen(false)}/>
  </>;
}
