import { useTheme } from "@/hooks/use-theme";

export function WorkspaceBackground() {
  const { workspaceBackground, workspaceAppearance } = useTheme();
  return (
    <img
      key={workspaceAppearance}
      src={workspaceBackground}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55 transition-opacity duration-500 dark:opacity-25"
      width={1920}
      height={1080}
    />
  );
}
