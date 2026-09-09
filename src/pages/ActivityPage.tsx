import { Clock3 } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { builderFeed, subFeed } from "@/data/networkData";

export default function ActivityPage() {
  const track = useTrack();
  const feed = track === "sub" ? subFeed : builderFeed;
  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[900px] p-4 lg:p-7">
        <header className="mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground [letter-spacing:.16em]">Company timeline</p>
          <h1 className="font-display text-3xl font-semibold">Activity</h1>
          <p className="mt-2 text-sm text-muted-foreground">Everything happening across projects, bids, costs, and compliance.</p>
        </header>
        <div className="odyssey-surface overflow-hidden rounded-2xl">
          {feed.map(item => (
            <div key={item.id} className="flex gap-3 border-b border-border/45 px-5 py-4 last:border-0">
              <Clock3 size={14} className="mt-0.5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.text}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.type} · {item.company} · {item.person} · {item.time}</p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-bold uppercase">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </TrackShell>
  );
}
