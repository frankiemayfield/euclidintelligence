# Expanded Workspace Environments

## Goal
Turn Appearance → Workspace Background into a six-environment gallery where each selection materially changes Euclid’s atmosphere without changing routes, workflows, data, or estimating behavior.

## Changes
- Create six original architectural and technical background artworks: Euclid, Da Vinci, Brunelleschi, Blueprint, Wright, and Fuller.
- Keep Euclid as the default and preserve the user’s existing Light, Dark, or System choice.
- Expand the appearance picker into a larger responsive gallery with 3 columns on desktop, 2 on medium screens, and 1 on small screens.
- Show each environment’s name, subtitle, selected border, check indicator, and restrained hover treatment.
- Preview an environment across the surrounding workspace while hovering or keyboard-focusing a card; commit and persist it only when selected.
- Apply environment-specific light and dark overlays, brightness, saturation, and softening so every mood remains recognizable and sea-glass content stays readable.
- Preserve the existing display controls, including layout density, table density, reduced motion, and high contrast.
- Keep the environment catalog data-driven so future options can be added without rebuilding the picker.

## Technical details
- Extend the shared theme state to support the six environment identifiers plus a temporary preview state.
- Keep local persisted selection backward-compatible with existing stored Euclid, Da Vinci, and Brunelleschi choices.
- Render the same shared background layer in Builder, Subcontractor, and Homeowner shells, so changes update immediately across Settings, Dashboard, estimating pages, comparison, proposal, menus, notifications, and Euclid AI.
- Use project-owned generated imagery only; no stock photography or literal plan scans.
- Verify the gallery, live preview, persistence, light/dark behavior, and all three application shells at desktop and mobile widths.
