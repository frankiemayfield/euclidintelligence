import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme, type WorkspaceAppearance } from "@/hooks/use-theme";
import euclid from "@/assets/euclid-environment.jpg";
import daVinci from "@/assets/workspace-da-vinci.jpg.asset.json";
import brunelleschi from "@/assets/workspace-brunelleschi.jpg.asset.json";
import { cn } from "@/lib/utils";

const modes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }, { value: "system", label: "System", icon: Monitor },
];
const scenes: { value: WorkspaceAppearance; label: string; description: string; image: string }[] = [
  { value: "da-vinci", label: "Da Vinci", description: "Geometric studies", image: daVinci.url },
  { value: "brunelleschi", label: "Brunelleschi", description: "Architectural studies", image: brunelleschi.url },
  { value: "euclid", label: "Euclid", description: "Construction geometry", image: euclid },
];

export function WorkspaceAppearancePicker() {
  const { theme, setTheme, workspaceAppearance, setWorkspaceAppearance } = useTheme();
  return <div className="space-y-6">
    <div>
      <p className="mb-3 text-xs font-semibold text-foreground">Color mode</p>
      <div className="grid grid-cols-3 gap-2">{modes.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => setTheme(value)} className={cn("relative flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs font-semibold transition-colors", theme === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card/45 text-muted-foreground hover:bg-card/70")}><Icon size={15}/>{label}{theme === value && <Check className="absolute right-2 top-2" size={12}/>}</button>)}</div>
    </div>
    <div>
      <p className="mb-3 text-xs font-semibold text-foreground">Workspace background</p>
      <div className="grid gap-3 sm:grid-cols-3">{scenes.map(scene => <button key={scene.value} onClick={() => setWorkspaceAppearance(scene.value)} className={cn("group overflow-hidden rounded-lg border text-left transition-all", workspaceAppearance === scene.value ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40")}>
        <span className="relative block aspect-[16/10] overflow-hidden"><img src={scene.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" width={320} height={200}/>{workspaceAppearance === scene.value && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={12}/></span>}</span>
        <span className="block bg-card/85 px-3 py-2"><span className="block text-xs font-semibold text-foreground">{scene.label}</span><span className="block text-[10px] text-muted-foreground">{scene.description}</span></span>
      </button>)}</div>
    </div>
  </div>;
}
