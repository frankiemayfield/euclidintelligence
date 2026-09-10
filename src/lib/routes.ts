/**
 * Canonical Euclid route builders.
 *
 * Projects own projects: every project page lives under `${base}/projects/:projectId/...`.
 * Precon, Operations and Financials own company-level tools and never nest projects.
 */
export type Base = "/app" | "/sub";

export type ProjectSectionId = "overview" | "preconstruction" | "schedule" | "selections" | "financials" | "documents";

export const projectsRoute = (base: string) => `${base}/projects`;
export const projectRoot = (base: string, projectId: string) => `${base}/projects/${projectId}`;
export const projectSection = (base: string, projectId: string, section: ProjectSectionId) =>
  `${projectRoot(base, projectId)}/${section}`;
export const projectFinancialTool = (base: string, projectId: string, tool = "budget") =>
  `${projectRoot(base, projectId)}/financials/${tool}`;
export const projectPreconStep = (base: string, projectId: string, step: string) =>
  `${projectRoot(base, projectId)}/preconstruction/${step}`;

/** Company-level tool routes. */
export const preconRoute = (base: string, tool: "overview" | "estimator" | "market-outlook" = "overview") => `${base}/precon/${tool}`;
export const operationsRoute = (base: string, tool: "overview" | "schedule" | "time-clock" = "overview") => `${base}/operations/${tool}`;
export const financialsRoute = (base: string, tool = "overview") => `${base}/financials/${tool}`;

/** Project financial tool slugs used in URLs, mapped to the tab ids the modules use. */
export const FINANCIAL_TOOL_SLUGS: Record<string, string> = {
  budget: "budget",
  costs: "costs",
  commitments: "commitments",
  "change-orders": "changes",
  changes: "changes",
  "client-billing": "billing",
  billing: "billing",
};
export const financialSlugForTab: Record<string, string> = {
  budget: "budget",
  costs: "costs",
  commitments: "commitments",
  changes: "change-orders",
  billing: "client-billing",
};

export const PRECON_STEPS = [
  { id: "documents", label: "Documents" },
  { id: "scope", label: "Scope Analyzer" },
  { id: "bid-packages", label: "Bid Packages" },
  { id: "estimate", label: "Estimate" },
  { id: "pricing", label: "Pricing & Margin" },
  { id: "proposal", label: "Proposal" },
  { id: "market-comparison", label: "Market Comparison" },
] as const;
export type PreconStepId = (typeof PRECON_STEPS)[number]["id"];
