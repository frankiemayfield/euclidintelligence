import { AppLayout } from "@/components/app/AppLayout";
import { SubLayout } from "@/components/sub/SubLayout";
import { useAuth } from "@/hooks/use-auth";
import type { DemoTrack } from "@/data/demoUniverse";

export const useTrack = (): DemoTrack => (useAuth().user?.accountTrack === "subcontractor" ? "sub" : "builder");

export function TrackShell({ children }: { children: React.ReactNode }) {
  const track = useTrack();
  return track === "sub" ? <SubLayout>{children}</SubLayout> : <AppLayout>{children}</AppLayout>;
}
