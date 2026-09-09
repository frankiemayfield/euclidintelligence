import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { workspaceEnvironments } from "@/components/app/workspaceEnvironments";
import { cn } from "@/lib/utils";

const modes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Automatic", icon: Monitor },
];

export function WorkspaceAppearancePicker() {
  const {
    theme,
    setTheme,
    workspaceAppearance,
    setWorkspaceAppearance,
    setPreviewWorkspaceAppearance,
  } = useTheme();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold text-foreground">Color mode</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Automatic follows your device setting.</p>
        </div>
        {/* compact segmented pills */}
        <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/55 p-1 backdrop-blur-md">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors",
                theme === value
                  ? "bg-[hsl(var(--env-accent)/0.14)] text-[hsl(var(--env-accent))] shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3">
          <p className="font-display text-sm font-bold text-foreground">Workspace environment</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Each environment sets the background, accent color and glass tint across Euclid. Hover to preview.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaceEnvironments.map((environment) => {
            const selected = workspaceAppearance === environment.value;
            return (
              <button
                type="button"
                key={environment.value}
                aria-pressed={selected}
                onClick={() => setWorkspaceAppearance(environment.value)}
                onMouseEnter={() => setPreviewWorkspaceAppearance(environment.value)}
                onMouseLeave={() => setPreviewWorkspaceAppearance(null)}
                onFocus={() => setPreviewWorkspaceAppearance(environment.value)}
                onBlur={() => setPreviewWorkspaceAppearance(null)}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-card/45 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5",
                  selected
                    ? "border-[hsl(var(--env-accent)/0.55)] shadow-[0_16px_40px_-20px_hsl(var(--env-accent)/0.8)] ring-2 ring-[hsl(var(--env-accent)/0.25)]"
                    : "border-border/60 hover:border-[hsl(var(--env-accent)/0.4)]",
                )}
              >
                <span className="relative block aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={environment.image}
                    alt={`${environment.label} workspace environment`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    width={640}
                    height={400}
                  />
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--env-accent))] text-primary-foreground shadow-md">
                      <Check size={14} />
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{environment.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{environment.description}</span>
                  </span>
                  <span
                    className="h-5 w-5 shrink-0 rounded-full ring-2 ring-inset ring-white/40"
                    style={{ background: `hsl(${environment.accentLight})` }}
                    aria-hidden="true"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
