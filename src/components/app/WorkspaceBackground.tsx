import { useTheme } from "@/hooks/use-theme";

export function WorkspaceBackground() {
  const { workspaceBackground, workspaceAppearance, previewWorkspaceAppearance, resolvedTheme } = useTheme();
  const activeAppearance = previewWorkspaceAppearance ?? workspaceAppearance;
  return (
    <div
      className="workspace-environment pointer-events-none absolute inset-0 overflow-hidden"
      data-environment={activeAppearance}
      data-mode={resolvedTheme}
      aria-hidden="true"
    >
      <div
        key={activeAppearance}
        className="workspace-environment-image absolute inset-0"
        style={{ backgroundImage: `url(${workspaceBackground})` }}
      />
      {/* atmospheric top wash — carries far down the page, no hard seam */}
      <span className="workspace-environment-wash absolute inset-0" />
      {/* overall readability veil */}
      <span className="workspace-environment-overlay absolute inset-0" />
    </div>
  );
}
