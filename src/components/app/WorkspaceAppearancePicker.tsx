import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { workspaceEnvironments } from "@/components/app/workspaceEnvironments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const modes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }, { value: "system", label: "System", icon: Monitor },
];
export function WorkspaceAppearancePicker() {
  const {
    theme,
    setTheme,
    workspaceAppearance,
    setWorkspaceAppearance,
    setPreviewWorkspaceAppearance,
  } = useTheme();
  return <div className="space-y-6">
    <div>
      <p className="mb-3 text-xs font-semibold text-foreground">Color mode</p>
      <div className="grid grid-cols-3 gap-2">{modes.map(({ value, label, icon: Icon }) => <Button type="button" variant="outline" key={value} onClick={() => setTheme(value)} className={cn("relative h-11 rounded-lg px-3 text-xs", theme === value ? "border-primary bg-primary/10 text-primary" : "bg-card/45 text-muted-foreground hover:bg-card/70")}><Icon size={15}/>{label}{theme === value && <Check className="absolute right-2 top-2" size={12}/>}</Button>)}</div>
    </div>
    <div>
      <div className="mb-3">
        <p className="text-xs font-semibold text-foreground">Workspace background</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Choose the architectural atmosphere behind your workspace.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{workspaceEnvironments.map(environment => <Button
        type="button"
        variant="outline"
        key={environment.value}
        aria-pressed={workspaceAppearance === environment.value}
        onClick={() => setWorkspaceAppearance(environment.value)}
        onMouseEnter={() => setPreviewWorkspaceAppearance(environment.value)}
        onMouseLeave={() => setPreviewWorkspaceAppearance(null)}
        onFocus={() => setPreviewWorkspaceAppearance(environment.value)}
        onBlur={() => setPreviewWorkspaceAppearance(null)}
        className={cn("group h-auto min-w-0 flex-col items-stretch gap-0 overflow-hidden rounded-xl p-0 text-left whitespace-normal transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-card/70", workspaceAppearance === environment.value ? "border-primary ring-2 ring-primary/20" : "border-border/70 bg-card/45 hover:border-primary/50")}
      >
        <span className="relative block aspect-[16/9] overflow-hidden bg-muted"><img src={environment.image} alt={`${environment.label} workspace environment`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" loading="lazy" width={640} height={360}/>{workspaceAppearance === environment.value && <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"><Check size={14}/></span>}</span>
        <span className="block w-full bg-card/80 px-4 py-3 backdrop-blur-md"><span className="block text-sm font-semibold text-foreground">{environment.label}</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{environment.description}</span></span>
      </Button>)}</div>
    </div>
  </div>;
}
