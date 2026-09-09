import { useMemo, useState } from "react";
import { Hash, Paperclip, Pin, Plus, Search, Smile, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { PromptInput, PromptInputButton, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

type ConstructionMessage = { id: number; author: string; initials: string; time: string; text: string; mine?: boolean; tag?: string };
const channels = [
  { name: "mayfield-hq", preview: "Frankie: Weekly estimating review", unread: 3, section: "Pinned" },
  { name: "fregolle-residence", preview: "Tyler: Revised framing scope", unread: 2, section: "Pinned" },
  { name: "oakwood-custom", preview: "James: Foundation bids are in", unread: 1, section: "Pinned" },
  { name: "estimating", preview: "Lisa: Pricing update posted", unread: 4, section: "Project channels" },
  { name: "bid-packages", preview: "Frankie: Fregolle framing normalized", unread: 0, section: "Project channels" },
  { name: "field-questions", preview: "Jordan: RFI 018 needs review", unread: 2, section: "Channels" },
  { name: "general", preview: "Company announcements", unread: 0, section: "Channels" },
];
const initialMessages: ConstructionMessage[] = [
  { id: 1, author: "Tyler Reed", initials: "TR", time: "9:41 AM", text: "The revised Fregolle framing quote includes the blocking and structural hardware clarifications.", tag: "Framing" },
  { id: 2, author: "Frankie Mayfield", initials: "FM", time: "9:48 AM", text: "Good. I normalized v2 against the issued construction set. The current quote is $131,850.", mine: true, tag: "Bid package" },
  { id: 3, author: "James O'Brien", initials: "JO", time: "10:03 AM", text: "I’ll get the utility allowance from the owner and attach it here before the leveling review." },
  { id: 4, author: "Frankie Mayfield", initials: "FM", time: "10:12 AM", text: "Please confirm the remaining framing assumption before we close scope review.", mine: true },
];
const members = ["Frankie Mayfield · Estimator / Preconstruction", "Tyler Reed · TrueFrame Estimator", "Jordan Ellis · Project Manager"];

export function ConstructionMessenger({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeChannel, setActiveChannel] = useState("maple-st-kitchen");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const filtered = useMemo(() => channels.filter(c => `${c.name} ${c.preview}`.toLowerCase().includes(search.toLowerCase())), [search]);
  if (!open) return null;
  const send = ({ text }: { text: string }) => {
    if (!text.trim()) return;
    setMessages(current => [...current, { id: Date.now(), author: "Frankie Mayfield", initials: "FM", time: "Now", text: text.trim(), mine: true }]);
  };
  return <div className="fixed inset-x-3 bottom-3 top-[86px] z-[80] lg:inset-x-5 lg:bottom-5">
    <div className="grid h-full min-h-0 grid-cols-[240px_minmax(0,1fr)_240px] gap-3 max-lg:grid-cols-[220px_minmax(0,1fr)] max-md:grid-cols-1">
      <aside className="odyssey-surface min-h-0 overflow-hidden rounded-2xl max-md:hidden">
        <div className="flex h-14 items-center justify-between border-b border-border/60 px-4"><div><p className="font-display text-base font-bold">Messages</p><p className="text-[10px] text-muted-foreground">Mayfield & Co.</p></div><Button size="icon" variant="ghost" className="h-8 w-8"><Plus size={15}/></Button></div>
        <div className="m-3 flex items-center gap-2 rounded-lg border border-border/70 bg-card/65 px-3 py-2"><Search size={13} className="text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages..." className="min-w-0 flex-1 bg-transparent text-xs outline-none"/></div>
        <div className="h-[calc(100%-7rem)] overflow-y-auto px-2 pb-3">{["Pinned","Project channels","Channels"].map(section => <div key={section} className="mb-3"><p className="px-2 py-1 text-[9px] font-bold uppercase text-muted-foreground">{section}</p>{filtered.filter(c=>c.section===section).map(c=><button key={c.name} onClick={()=>setActiveChannel(c.name)} className={cn("mb-0.5 flex w-full gap-2 rounded-lg px-2 py-2 text-left",activeChannel===c.name?"bg-primary/12 text-foreground":"hover:bg-card/50")}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Hash size={13}/></span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{c.name}</span><span className="block truncate text-[9px] text-muted-foreground">{c.preview}</span></span>{c.unread>0&&<span className="mt-1 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">{c.unread}</span>}</button>)}</div>)}</div>
      </aside>
      <section className="odyssey-surface flex min-h-0 flex-col overflow-hidden rounded-2xl">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Hash size={14}/></span><div><p className="text-sm font-bold">{activeChannel}</p><p className="text-[10px] text-muted-foreground">Project channel · 4 members</p></div></div><div className="flex items-center"><Button variant="ghost" size="icon" className="h-8 w-8"><Pin size={14}/></Button><Button variant="ghost" size="icon" className="h-8 w-8"><Users size={14}/></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X size={16}/></Button></div></header>
        <Conversation className="min-h-0"><ConversationContent className="gap-4 p-5">{messages.map(m=><Message key={m.id} from={m.mine?"user":"assistant"} className="max-w-[88%]"><div className={cn("flex gap-2.5",m.mine&&"justify-end")}><span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",m.mine?"order-2 bg-primary text-primary-foreground":"bg-secondary text-secondary-foreground")}>{m.initials}</span><div className={cn("min-w-0",m.mine&&"text-right")}><p className="mb-1 text-[10px] font-semibold">{m.author} <span className="ml-1 font-normal text-muted-foreground">{m.time}</span></p><MessageContent className={cn("text-left leading-relaxed",m.mine&&"bg-primary text-primary-foreground group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground")}>{m.text}{m.tag&&<span className={cn("mt-2 block w-fit rounded-md px-2 py-1 text-[9px]",m.mine?"bg-primary-foreground/15 text-primary-foreground":"bg-primary/10 text-primary")}>{m.tag}</span>}</MessageContent></div></div></Message>)}<ConversationScrollButton/></ConversationContent></Conversation>
        <div className="shrink-0 border-t border-border/60 p-3"><PromptInput onSubmit={send} className="rounded-xl bg-card/70"><PromptInputTextarea placeholder={`Message #${activeChannel}`} className="min-h-12 text-xs"/><PromptInputFooter><PromptInputTools><PromptInputButton tooltip="Attach file"><Paperclip size={14}/></PromptInputButton><PromptInputButton tooltip="Add reaction"><Smile size={14}/></PromptInputButton></PromptInputTools><PromptInputSubmit/></PromptInputFooter></PromptInput></div>
      </section>
      <aside className="odyssey-surface min-h-0 overflow-y-auto rounded-2xl p-4 max-lg:hidden"><div className="mb-4 flex items-start gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Hash size={14}/></span><div><p className="text-sm font-bold">{activeChannel}</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Coordination channel for scope, takeoff, pricing, and field questions.</p></div></div><p className="mb-2 text-[9px] font-bold uppercase text-muted-foreground">Members · 4</p><div className="space-y-2">{members.map((member,i)=><div key={member} className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[8px] font-bold">{["SC","RM","JO","LC"][i]}</span><span className="text-[10px]">{member}</span></div>)}</div><p className="mb-2 mt-5 text-[9px] font-bold uppercase text-muted-foreground">Pinned resources</p>{["Issued Scope Package.pdf","Division 26 Bid Leveling","Lighting Allowance Log","RFI-018 Temporary Power"].map(r=><button key={r} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[10px] text-muted-foreground hover:bg-card/60 hover:text-foreground"><Pin size={11}/>{r}</button>)}</aside>
    </div>
  </div>;
}
