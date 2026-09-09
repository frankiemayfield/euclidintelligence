import { useTheme } from "@/hooks/use-theme";

export function WorkspaceBackground() {
  const { workspaceBackground, workspaceAppearance, previewWorkspaceAppearance, resolvedTheme } = useTheme();
  const activeAppearance = previewWorkspaceAppearance ?? workspaceAppearance;
  return (
    <div className="workspace-environment pointer-events-none absolute inset-0 overflow-hidden" data-environment={activeAppearance} data-mode={resolvedTheme} aria-hidden="true">
      <img
        key={activeAppearance}
        src={workspaceBackground}
        alt=""
        className="workspace-environment-image h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <span className="workspace-environment-overlay absolute inset-0" />
    </div>
  );
}
