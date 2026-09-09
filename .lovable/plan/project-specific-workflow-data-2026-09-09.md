# Project-Specific Workflow Data

## Goal
Make every demo project behave as its own estimate: selecting or opening a project loads that project's records and takes the user to its current workflow stage.

## Changes
- Expand the shared demo registry with project-specific documents, scope progress, bids, estimate breakdowns, pricing, proposal status, benchmarks, actuals, dates, alerts, and activities.
- Make the global project selector navigate immediately to the selected project's current Builder or TrueFrame workflow step.
- Keep dashboard cards stage-aware and ensure each project opens at its own endpoint.
- Replace remaining Fregolle-only/static downstream page records with values derived from the selected project.
- Preserve the real Fregolle plan/takeoff experience; other projects will show their own documents and stage-appropriate incomplete states rather than copied Fregolle evidence.
- Verify all six Builder projects and all six TrueFrame projects show distinct data and open at the correct stage.

## Expected workflow endpoints
- Riverside Addition → Document Upload
- Fregolle Residence → Scope Analyzer
- Hyde Park Residence → Bid Packages for Builder / Estimate for TrueFrame
- Maple Street Kitchen Remodel → Pricing & Margin
- Oakwood Custom Home → Proposal Export
- Downtown TI → Estimate vs Actual

## Technical details
- Continue using the existing typed demo registry and project context as the single source of truth.
- Add stage-specific project records without changing routes, formulas, authentication, or existing takeoff calculations.
- Update shared selectors and downstream views only; no visual redesign.
