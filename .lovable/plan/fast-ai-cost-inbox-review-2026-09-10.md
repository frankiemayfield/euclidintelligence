# Fast AI Cost Inbox Review

## Goal
Turn Financials → Cost Inbox into a dense processing queue where Euclid presents its conclusion first, reveals evidence only when needed, and lets clean costs post in seconds without changing the shared financial model or other product areas.

## Queue workspace
- Replace the large uploader, Sources card, and metric cards with a slim intake bar, source actions, compact status tabs with live counts, search, quick filters, and advanced filters.
- Make the high-opacity queue table fill the available workspace, keep 44–52px rows, add source labels and an optional Columns menu, and preserve row selection.
- Add inline Approve for clean Ready items and a contextual bulk bar that only approves eligible Ready rows; non-ready selections remain available for reassignment or flagging.
- Keep Posted records in the same queue as viewable history while removing approved items from active status counts.

## Adaptive review workspace
- Replace the stacked review page with a viewport-height master/detail workspace: document preview on the left and a compact review panel on the right; use Document/Review tabs on small screens.
- Add document fit/zoom/page/rotate controls, hide/show document behavior, previous/next record navigation, and a sticky review action bar.
- Show a conclusion-first header, compact document facts, editable project/phase/cost-code/estimate-line/commitment controls, line-coding summary, balanced-allocation validation, short financial impact, and Approve & Post.
- Keep AI reasons, source evidence, full extraction, mapping details, line table, and history collapsed behind “Why this match?”, “Review Line Coding”, “History”, and “Review All Details”.

## Confidence-driven complexity
- Ready: show only summary, coding, collapsed line allocation, financial impact, and approval.
- Needs Review: automatically focus the uncertain vendor, project, coding, or progress decision and present likely choices.
- Exception: lead with the exact decision. Build dedicated incoming-vs-existing duplicate comparison, commitment-overage math/actions, unknown-project choices, and unknown-vendor matching/creation actions before supporting coding.
- Automatically expand line coding for low-confidence mappings, multiple materially different codes, commitment mismatch, imbalance, or other unresolved allocation risk.

## Posting and interaction
- Keep one Inbox item becoming one Cost object; derive the same pending posted state into Costs, Budget actuals, commitment invoiced values, Network history, Estimate vs Actual, Activity, and QBO queue without duplicating records.
- After single or bulk approval, update all derived views, show brief success feedback, update counts, and open the next unprocessed item by default.
- Add keyboard review controls: Enter approves eligible clean items, J/Down and K/Up navigate, E focuses coding, F flags, and Escape closes review; expose shortcuts only through tooltips.
- Prevent posting while allocation totals are unbalanced unless an explicit override path is chosen.

## Demo coverage and validation
- Keep all eight existing records and enrich their review metadata rather than changing established relationships.
- Verify the clean Hyde Park invoice, fast Ferguson receipt, duplicate invoice, $7,200 commitment overage, low-confidence unknown vendor/project, posted-record history, inline/bulk approval, next-item behavior, search/filters, and environment accent styling.
- Validate desktop split view, tablet/mobile tabs with sticky approval, light/dark environments, selected-environment primary actions, no horizontal overflow, clean typecheck/build, and no new runtime errors.

## Technical details
- Extend the shared financial data with review metadata, alternatives, history, source filename, match rationale, and posting linkage while preserving existing IDs and selectors.
- Keep transaction state centralized at the Cost Inbox page level and derive queue, posted costs, budget/commitment deltas, and activity entries from that single state during the mock session.
- Break the page into focused queue, preview, review-summary, exception, line-coding, and action-bar components so conditional disclosure remains readable and extensible.
- Reuse the current Button, menu, tooltip, toast, theme tokens, and Financials navigation components; add only Cost Inbox-specific high-opacity surface tokens/classes.
