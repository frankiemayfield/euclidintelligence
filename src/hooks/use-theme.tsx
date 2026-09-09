import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  isWorkspaceAppearance,
  workspaceBackgrounds,
  type WorkspaceAppearance,
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
  const value = useMemo(() => ({
    theme,
    setTheme,
    resolvedTheme,
    workspaceAppearance,
    setWorkspaceAppearance,
    previewWorkspaceAppearance,
    setPreviewWorkspaceAppearance,
    workspaceBackground: workspaceBackgrounds[activeWorkspaceAppearance],
  }), [theme, resolvedTheme, workspaceAppearance, previewWorkspaceAppearance, activeWorkspaceAppearance]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
