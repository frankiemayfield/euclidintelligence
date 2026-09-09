import blueprint from "@/assets/environments/blueprint-environment.jpg.asset.json";
import brunelleschi from "@/assets/environments/brunelleschi-environment.jpg.asset.json";
import daVinci from "@/assets/environments/da-vinci-environment.jpg.asset.json";
import euclid from "@/assets/environments/euclid-environment.jpg.asset.json";
import fuller from "@/assets/environments/fuller-environment.jpg.asset.json";
import wright from "@/assets/environments/wright-environment.jpg.asset.json";

/**
 * One environment = one complete visual atmosphere.
 * Every token below is published as a CSS custom property by the theme provider,
 * so shared components consume tokens instead of hard-coded per-environment colors.
 * HSL values are stored as bare triplets so they compose with hsl(var(--x) / alpha).
 */
export interface WorkspaceEnvironment {
  value: string;
  label: string;
  description: string;
  image: string;
  /** background-position for desktop and for narrow screens */
  position: string;
  positionMobile: string;
  /** primary + secondary accent per color mode */
  accentLight: string;
  accentDarkMode: string;
  secondaryLight: string;
  secondaryDarkMode: string;
  /** very subtle glass undertone applied to surfaces */
  tintLight: string;
  tintDarkMode: string;
}

export const workspaceEnvironments = [
  {
    value: "euclid",
    label: "Euclid",
    description: "Geometry & proportion",
    image: euclid.url,
    position: "50% 42%",
    positionMobile: "38% 45%",
    accentLight: "196 78% 32%",
    accentDarkMode: "192 82% 60%",
    secondaryLight: "210 34% 34%",
    secondaryDarkMode: "208 40% 68%",
    tintLight: "196 60% 92%",
    tintDarkMode: "200 40% 16%",
  },
  {
    value: "da-vinci",
    label: "Da Vinci",
    description: "Invention & mechanics",
    image: daVinci.url,
    position: "50% 46%",
    positionMobile: "42% 48%",
    accentLight: "27 62% 34%",
    accentDarkMode: "34 74% 62%",
    secondaryLight: "30 34% 40%",
    secondaryDarkMode: "32 40% 70%",
    tintLight: "34 52% 92%",
    tintDarkMode: "30 30% 15%",
  },
  {
    value: "brunelleschi",
    label: "Brunelleschi",
    description: "Structure & perspective",
    image: brunelleschi.url,
    position: "42% 45%",
    positionMobile: "30% 48%",
    accentLight: "16 62% 42%",
    accentDarkMode: "18 72% 62%",
    secondaryLight: "24 32% 42%",
    secondaryDarkMode: "26 38% 70%",
    tintLight: "24 48% 93%",
    tintDarkMode: "20 26% 15%",
  },
  {
    value: "blueprint",
    label: "Blueprint",
    description: "Plans & construction",
    image: blueprint.url,
    position: "52% 44%",
    positionMobile: "44% 46%",
    accentLight: "210 84% 34%",
    accentDarkMode: "196 92% 62%",
    secondaryLight: "214 46% 40%",
    secondaryDarkMode: "212 52% 70%",
    tintLight: "208 66% 92%",
    tintDarkMode: "212 52% 15%",
  },
  {
    value: "wright",
    label: "Wright",
    description: "Form & space",
    image: wright.url,
    position: "50% 48%",
    positionMobile: "40% 50%",
    accentLight: "12 56% 40%",
    accentDarkMode: "18 62% 62%",
    secondaryLight: "32 34% 40%",
    secondaryDarkMode: "36 38% 70%",
    tintLight: "30 42% 93%",
    tintDarkMode: "22 22% 15%",
  },
  {
    value: "fuller",
    label: "Fuller",
    description: "Systems & structure",
    image: fuller.url,
    position: "46% 44%",
    positionMobile: "34% 46%",
    accentLight: "202 52% 34%",
    accentDarkMode: "198 66% 64%",
    secondaryLight: "212 18% 42%",
    secondaryDarkMode: "210 20% 72%",
    tintLight: "205 34% 93%",
    tintDarkMode: "208 22% 15%",
  },
] as const satisfies readonly WorkspaceEnvironment[];

export type WorkspaceAppearance = (typeof workspaceEnvironments)[number]["value"];

export const workspaceBackgrounds = Object.fromEntries(
  workspaceEnvironments.map(({ value, image }) => [value, image]),
) as Record<WorkspaceAppearance, string>;

export const environmentByValue = Object.fromEntries(
  workspaceEnvironments.map((environment) => [environment.value, environment]),
) as Record<WorkspaceAppearance, WorkspaceEnvironment>;

export function isWorkspaceAppearance(value: string | null): value is WorkspaceAppearance {
  return workspaceEnvironments.some((environment) => environment.value === value);
}
