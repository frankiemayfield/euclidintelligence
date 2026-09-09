# One Connected Euclid Demo Universe

## Goal
Replace page-local mock records with one shared, typed demo-data layer so Builder and TrueFrame views reference the same companies, people, projects, documents, quotes, pricing, proposals, benchmarks, activity, notifications, and actual costs. Preserve all existing UI and workflows.

## Shared foundation
- Create canonical registries for Mayfield & Co., TrueFrame Carpentry, Frankie Mayfield, Tyler Reed, the reusable subcontractor pool, and exactly six shared projects.
- Model project-linked documents, financials, quotes and revisions, benchmarks, actuals, change orders, activity, notifications, and workflow readiness by stable IDs.
- Keep the real `FinalConstructionSetFregolle.pdf` and existing Fregolle sheet references, quantities, takeoffs, formulas, and source citations.
- Add a shared project context with Fregolle as each demo account’s default; persist each track’s selection and expose reusable project selectors/helpers.

## Builder migration
- Set Frankie Mayfield as the Builder demo identity across login, header, profile/settings, dashboard, notifications, activity, exports, and Euclid AI.
- Drive the dashboard and project selector from the six canonical projects and their exact stages.
- Connect Document Upload, Scope Analyzer, Bid Packages, Estimate, Pricing & Margin, Proposal Export, Market Comparison, and Estimate vs Actual to the active project.
- Make Fregolle totals consistently derive to $1,182,400 builder cost, $1,418,880 client price, $236,480 gross profit, 20% markup, 16.7% gross margin, score 88, and the $1.35M–$1.47M cohort range.
- Use Downtown TI’s prescribed budget, CO, actual, forecast, and transaction state; show truthful not-yet-available states for preconstruction projects.

## TrueFrame migration
- Set Tyler Reed as the sole primary TrueFrame demo estimator across login, header, settings/profile, dashboard, notifications, exports, and Euclid AI.
- Drive the Sub dashboard and every downstream page from the same six project records and stages.
- Link Fregolle’s quote revision history (`v1 $126,400`, `v2/current $131,850`) to the exact bid object used in Mayfield Bid Packages.
- Keep quote structure, estimate, pricing, proposal, market comparison, and actuals aligned with the active project and its readiness.

## Consistency and cleanup
- Replace obsolete Sarah/Alex/Ryan-primary identities, unrelated projects, duplicate totals, and fake Fregolle filenames wherever they represent the main demo universe.
- Preserve intentional secondary contacts only when they are reusable registry entries.
- Ensure every displayed number can be traced to the canonical project, quote, benchmark, source, or calculation.

## Verification
- Test Frankie on Fregolle across documents, Scope Analyzer, Bid Packages, Estimate, Pricing, Market, Proposal, and Actuals.
- Switch to Oakwood and confirm no Fregolle project values remain.
- Test Tyler on Fregolle and confirm identity, GC, real plans, quote history/current amount, downstream totals, benchmark, and the shared Mayfield-side quote.
- Check all six projects in both selectors, stage-aware empty states, activity/notifications, Euclid AI context, and a clean typecheck/build.
