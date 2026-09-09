# Simplify Builder and Subcontractor Scope Analyzer

## Goal
Replace the current hierarchy-first Scope Analyzer shell with one calmer, shared workflow that guides both account types through plans, review, structure, and the correct next step. Preserve the existing plan viewer, takeoff geometry, calculations, source data, mappings, routes, and downstream pages.

## Shared workspace
- Build one shared Scope Analyzer shell configured by account type instead of separate page implementations.
- Use the existing Estimator sidebar and a nearly full-width, more opaque sea-glass workspace without nested card layers.
- Replace the old project overview and permanent hierarchy/inspector layout with a compact page header, readiness ribbon, tabs, filters, and a single primary table/work queue.
- Keep the plan viewer and all four viewer modes available from Quantity Takeoff and expanded evidence rows; do not alter its geometry, calibration, or measurement behavior.

## Header and navigation
- Add a compact ribbon summarizing extracted, review-needed, structured, scale-derived, low-confidence, and open-issue counts.
- Make Quantity Takeoff the default tab.
- Builder tabs: **Quantity Takeoff → Review → Scope Structure**.
- Subcontractor tabs: **Quantity Takeoff → Review → Quote Structure → Bid Package**.
- Remove Overview, standalone Assumptions, standalone Scope Issues, and Builder Sub Bid Packages from this workspace only.

## Quantity Takeoff
- Create one shared takeoff table with Select, Description, Qty, Unit, Sheet / Plan Reference, Method, Confidence, and Status.
- Add working All, Explicit, Scale-Derived, Low Confidence, and Needs Review filter chips with live counts.
- Preserve multi-select and show bulk actions only while rows are selected.
- Use one expanded-row component with three columns: Source & Detection, Quantity Derivation, and Assumptions & Review.
- Derive readable formulas, measurements, conversions, waste notes, and final quantity from existing takeoff/source fields without changing the underlying quantity records.
- Make Confirm, Adjust, and Flag update the local review state and keep row, ribbon, Review queue, and downstream structure synchronized.

## Review work queue
- Combine assumptions and current issue flags into one normalized view model without changing the project data schema.
- Add filters for All, Assumptions, Missing Scope, Conflicts, Duplicates, Exclusion Risks, and Resolved.
- Implement contextual actions such as Confirm, Adjust, Add to Scope, Clarify, Exclude, select source, Merge, and Keep Separate.
- Store action results as workspace state overlays so resolved items leave the open queue and their linked takeoff/structure rows reflect the decision.

## Shared structure table
- Use one configurable mapping table for both account types, with expandable rows and conditional bulk action bar.
- Builder visible columns: Select, Scope Item, Qty, Trade, Cost Code, Estimate Section, Status. Expanded details retain source, confidence, derivation, CSI, and mapping actions.
- Sub visible columns: Select, Scope Item, Qty, Category, Mapped To, Quote Section, Status. Expanded details expose trade category, quote mapping, quote section, company code, and optional CSI export mapping.
- Support Auto-map unassigned, Apply defaults, Create line item, Add to existing line item, Merge, Split, and Defer while preserving existing codes and mappings.

## Final workflow steps
- Builder: add **Continue to Bid Packages** in Scope Structure and use the existing transition into `/app/bid-leveling`; leave that page unchanged.
- Subcontractor: assemble its own Bid Package from mapped line items, inclusions, exclusions, clarifications, RFIs, allowances, alternates, and assumptions.
- Add **Build Estimate** with the requested staged transition into `/sub/estimate-builder`; leave separate Sub Bid Packages/Bid Leveling unchanged.

## Presentation and assistant context
- Reduce pill emphasis by separating strong navigation tabs, quiet filters, and semantic status badges.
- Apply a denser-workspace surface treatment to Scope Analyzer and other listed estimator data pages while preserving each selected environment and light/dark behavior.
- Feed the active Scope Analyzer tab and live counts into Euclid AI so its summary and suggested prompts match Takeoff, Review, Structure, or Bid Package.

## Verification
- Verify exact tab labels and default tabs for Builder and Subcontractor.
- Exercise filter chips, expansion, selection/bulk actions, review resolution, mapping, plan-viewer opening, and both final transitions.
- Confirm Builder Bid Packages and separate Sub Bid Packages remain unchanged.
- Check light and dark modes at desktop width, then run the project typecheck and inspect preview diagnostics.
