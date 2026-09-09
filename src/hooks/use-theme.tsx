import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  environmentByValue,
  isWorkspaceAppearance,
  workspaceBackgrounds,
  type WorkspaceAppearance,
  type WorkspaceEnvironment,
} from "@/components/app/workspaceEnvironments";

export type Theme = "light" | "dark" | "system";
export type { WorkspaceAppearance } from "@/components/app/workspaceEnvironments";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  workspaceAppearance: WorkspaceAppearance;
  setWorkspaceAppearance: (appearance: WorkspaceAppearance) => void;
  previewWorkspaceAppearance: WorkspaceAppearance | null;
  setPreviewWorkspaceAppearance: (appearance: WorkspaceAppearance | null) => void;
  workspaceBackground: string;
  environment: WorkspaceEnvironment;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
  workspaceAppearance: "euclid",
  setWorkspaceAppearance: () => {},
  previewWorkspaceAppearance: null,
  setPreviewWorkspaceAppearance: () => {},
  workspaceBackground: workspaceBackgrounds.euclid,
  environment: environmentByValue.euclid,
});

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (typeof window === "undefined" ? "light" : (localStorage.getItem("euclid-theme") as Theme) || "light"));
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [workspaceAppearance, setWorkspaceAppearance] = useState<WorkspaceAppearance>(() => {
    if (typeof window === "undefined") return "euclid";
    const stored = localStorage.getItem("euclid-workspace-appearance");
    return isWorkspaceAppearance(stored) ? stored : "euclid";
  });
  const [previewWorkspaceAppearance, setPreviewWorkspaceAppearance] = useState<WorkspaceAppearance | null>(null);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
    localStorage.setItem("euclid-theme", theme);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => localStorage.setItem("euclid-workspace-appearance", workspaceAppearance), [workspaceAppearance]);
  const activeWorkspaceAppearance = previewWorkspaceAppearance ?? workspaceAppearance;
  const environment = environmentByValue[activeWorkspaceAppearance];

  // Publish the environment token set once, at the root. Every shared component
  // reads these variables instead of hard-coding per-environment colors.
  useEffect(() => {
    const root = document.documentElement;
    const dark = resolvedTheme === "dark";
    const activeAccent = dark ? environment.accentDarkMode : environment.accentLight;
    const activeTint = dark ? environment.tintDarkMode : environment.tintLight;
    root.style.setProperty("--env-accent", activeAccent);
    root.style.setProperty("--env-accent-soft", dark ? environment.secondaryDarkMode : environment.secondaryLight);
    root.style.setProperty("--env-tint", activeTint);
    // Primary controls, selected workflow states, focus rings, and sidebar
    // selection all inherit the active environment instead of a fixed brand hue.
    root.style.setProperty("--primary", activeAccent);
    root.style.setProperty("--primary-foreground", dark ? "215 20% 7%" : "0 0% 100%");
    root.style.setProperty("--ring", activeAccent);
    root.style.setProperty("--accent", activeTint);
    root.style.setProperty("--accent-foreground", activeAccent);
    root.style.setProperty("--sidebar-primary", activeAccent);
    root.style.setProperty("--sidebar-accent", activeTint);
    root.style.setProperty("--sidebar-accent-foreground", activeAccent);
    root.style.setProperty("--env-position", environment.position);
    root.style.setProperty("--env-position-mobile", environment.positionMobile);
    root.dataset.environment = environment.value;
  }, [environment, resolvedTheme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    resolvedTheme,
    workspaceAppearance,
    setWorkspaceAppearance,
    previewWorkspaceAppearance,
    setPreviewWorkspaceAppearance,
    workspaceBackground: workspaceBackgrounds[activeWorkspaceAppearance],
    environment,
  }), [theme, resolvedTheme, workspaceAppearance, previewWorkspaceAppearance, activeWorkspaceAppearance, environment]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
