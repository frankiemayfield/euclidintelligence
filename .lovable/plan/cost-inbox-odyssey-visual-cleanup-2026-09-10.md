# Cost Inbox Odyssey Visual Cleanup

## Goal
Keep every Cost Inbox behavior intact while consolidating the queue into one calm, high-contrast financial workspace that remains legible across all six environment themes and light/dark modes.

## Page hierarchy
- Compress the title area and keep only the functional Financials subnav items, with one understated selected state.
- Combine document intake, secondary sources, search, project filtering, source filtering, and optional columns into one shared toolbar surface.
- Present queue states as a compact segmented text row rather than separate floating pills.
- Make the queue table the primary high-opacity workspace with a stronger header band, restrained separators, subtle hover/selection, compact status chips, plain confidence text, and smaller row actions.

## Shared visual system
- Add reusable semantic workspace, toolbar, input, segmented-control, and status styles using environment-aware tokens for light and dark modes.
- Normalize buttons, fields, and dropdowns to moderate radii and clear primary/secondary/tertiary hierarchy without hard-coded environment colors.
- Preserve environment visibility around the workspace while minimizing artwork show-through beneath dense financial data.
- Apply the same calm surface hierarchy to the existing review split view without changing its decisions, disclosures, or posting behavior.

## Responsive behavior
- Keep one aligned toolbar on wide screens.
- On tighter widths, retain Add Documents, search, and filters while placing Email, QBO Sync, Card Feed, and Manual inside a compact Sources menu.
- Keep existing mobile Document/Review behavior and sticky approval actions.

## Validation
- Verify queue filters, search, project/source filters, row selection, inline approval, bulk approval, review navigation, and exception decisions still work.
- Visually validate Blueprint in light and dark modes, then spot-check all other environments for readable surfaces and environment-reactive accents.
- Check desktop and mobile widths for clean alignment, no horizontal page overflow, and no new runtime or build errors.

## Technical details
- Scope product changes to the Cost Inbox and its Financials subnav; add generic CSS primitives in the shared theme stylesheet for later Financials reuse.
- Reuse the existing Button and menu primitives, preserving all current data and state logic.
