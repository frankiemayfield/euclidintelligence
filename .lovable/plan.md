# Odyssey Interface Completion

## Goal
Finish the Euclid visual migration by matching the supplied Odyssey references while preserving Euclid workflows and data.

## Changes
- Rebuild the shared header to match Odyssey’s flat glass navigation, original Euclid logo, active navigation pill, message/notification controls, settings access, and profile treatment.
- Replace the placeholder Messages action with a functional Slack-style three-column messenger using construction channels, conversations, members, resources, and message composition.
- Fix notification stacking so the panel always renders above page content and mirrors the reference tabs, filters, rows, and footer.
- Restore the original Euclid logo in the header and use the Euclid compass mark for the assistant launcher, panel identity, and favicon.
- Add Workspace Appearance controls for Light/Dark/System and Da Vinci, Brunelleschi, and Euclid backgrounds; persist selections and apply them across Builder, Subcontractor, and Homeowner shells.
- Align shared glass cells, menus, spacing, typography, and surface hierarchy with the Odyssey screenshots without changing product routes or estimating logic.

## Technical details
- Extend the existing theme context with a persisted workspace-background setting.
- Add shared messenger and brand-mark components used by every authenticated track.
- Keep all interface colors on semantic design tokens and use the existing generated architectural environment for the Euclid background plus coordinated project-owned assets for the other choices.
- Verify the Builder dashboard, notification overlay, messenger, appearance settings, dark mode, and cross-track shared shell at desktop size.
