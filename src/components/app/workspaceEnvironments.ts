import blueprint from "@/assets/environments/blueprint-environment.jpg.asset.json";
import brunelleschi from "@/assets/environments/brunelleschi-environment.jpg.asset.json";
import daVinci from "@/assets/environments/da-vinci-environment.jpg.asset.json";
import euclid from "@/assets/environments/euclid-environment.jpg.asset.json";
import fuller from "@/assets/environments/fuller-environment.jpg.asset.json";
import wright from "@/assets/environments/wright-environment.jpg.asset.json";

export const workspaceEnvironments = [
  { value: "euclid", label: "Euclid", description: "Geometry & proportion", image: euclid.url },
  { value: "da-vinci", label: "Da Vinci", description: "Invention & mechanics", image: daVinci.url },
  { value: "brunelleschi", label: "Brunelleschi", description: "Structure & perspective", image: brunelleschi.url },
  { value: "blueprint", label: "Blueprint", description: "Plans & construction", image: blueprint.url },
  { value: "wright", label: "Wright", description: "Form & space", image: wright.url },
  { value: "fuller", label: "Fuller", description: "Systems & structure", image: fuller.url },
] as const;

export type WorkspaceAppearance = (typeof workspaceEnvironments)[number]["value"];

export const workspaceBackgrounds = Object.fromEntries(
  workspaceEnvironments.map(({ value, image }) => [value, image]),
) as Record<WorkspaceAppearance, string>;

export function isWorkspaceAppearance(value: string | null): value is WorkspaceAppearance {
  return workspaceEnvironments.some((environment) => environment.value === value);
}