import { Navigate } from "react-router-dom";
import { useTrack } from "@/components/app/TrackShell";

/** Legacy per-pillar project directories now resolve to the one canonical Projects page. */
export default function ProjectsRedirect({ stage }: { stage?: "precon" | "active" | "completed" }) {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  return <Navigate to={`${base}/projects${stage ? `?stage=${stage}` : ""}`} replace />;
}
