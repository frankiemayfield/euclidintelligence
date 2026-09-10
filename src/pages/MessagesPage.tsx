import { useSearchParams } from "react-router-dom";
import { TrackShell } from "@/components/app/TrackShell";
import { MessengerBody } from "@/components/app/ConstructionMessenger";

export default function MessagesPage() {
  const [params] = useSearchParams();
  const channel = params.get("channel") ?? undefined;
  return (
    <TrackShell>
      <div className="flex h-full w-full flex-col p-4 lg:p-6">
        <header className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Communication</p>
          <h1 className="font-display text-2xl font-semibold">Messages</h1>
        </header>
        <div className="min-h-0 flex-1"><MessengerBody initialChannel={channel} /></div>
      </div>
    </TrackShell>
  );
}
