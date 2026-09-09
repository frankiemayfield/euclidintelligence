import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import euclid from "@/assets/euclid-environment.jpg";
import daVinci from "@/assets/workspace-da-vinci.jpg.asset.json";
import brunelleschi from "@/assets/workspace-brunelleschi.jpg.asset.json";

export type Theme = "light" | "dark" | "system";
export type WorkspaceAppearance = "da-vinci" | "brunelleschi" | "euclid";

const backgrounds: Record<WorkspaceAppearance, string> = {
  "da-vinci": daVinci.url,
  brunelleschi: brunelleschi.url,
  euclid,
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  workspaceAppearance: WorkspaceAppearance;
  setWorkspaceAppearance: (appearance: WorkspaceAppearance) => void;
  workspaceBackground: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
  workspaceAppearance: "euclid",
  setWorkspaceAppearance: () => {},
  workspaceBackground: backgrounds.euclid,
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
    return (localStorage.getItem("euclid-workspace-appearance") as WorkspaceAppearance) || "euclid";
  });
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
  const value = useMemo(() => ({ theme, setTheme, resolvedTheme, workspaceAppearance, setWorkspaceAppearance, workspaceBackground: backgrounds[workspaceAppearance] }), [theme, resolvedTheme, workspaceAppearance]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
