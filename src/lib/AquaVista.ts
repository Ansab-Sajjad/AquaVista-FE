/**
 * AquaVista PoC guardrails and terminology
 *
 * These rules are derived from the AquaVista Product Requirements Document
 * and are used to keep the user interface, prompts, and assistant responses
 * aligned with the product vision.
 */

export const AquaVista = {
  // Branding and naming
  assistantName: "AVA",
  assistantFullName: "AquaVista Assistant",
  productName: "AquaVista",
  productTagline: "Municipal rate-study analysis platform",

  // Role names
  roles: {
    superAdmin: "Super Admin",
    projectUser: "Project User",
  },

  // Preferred terminology
  terminology: {
    project: "Project",
    municipality: "Municipality",
    baselineData: "Baseline Data",
    financialSnapshot: "Financial Snapshot",
    customerAllocation: "Customer Allocation / Billing Data",
    cipRegister: "CIP Register",
    rateTable: "Rate Table",
    dashboard: "Dashboard",
    pinnedContent: "Pinned Content",
    insight: "Insight",
  },

  // Data upload file types
  dataFileTypes: [
    "Financial Snapshot",
    "Customer Allocation / Billing Data",
    "CIP Register",
    "Rate Table",
    "Demographics",
    "Budget / Audit Data",
    "Rate Resolution",
  ] as const,

  // What AVA can and cannot do
  assistantGuardrails: {
    allowedTopics: [
      "Municipal water and sewer finance",
      "Project-specific uploaded data",
      "Revenue, expense, and rate calculations",
      "Customer class allocation and consumption",
      "Debt service and covenant analysis",
      "Capital improvement planning",
      "Rate adequacy and sufficiency",
      "Dashboard-pinned insights",
    ],
    disallowedTopics: [
      "External municipal utilities without uploaded data",
      "General policy or political advice",
      "Speculative financial forecasting beyond the provided data",
      "Personal or non-project information",
    ],
    behaviors: [
      "Ground every answer in the project's uploaded data when possible.",
      "Cite the source file and year when using uploaded baseline data.",
      "Avoid speculation; ask for clarification when data is incomplete.",
      "Never compare the municipality to other utilities unless the data is present.",
      "Keep responses concise, structured, and free of invented numbers.",
    ],
  },
} as const;

/**
 * Returns true if the user's prompt appears to be within AVA's allowed scope.
 */
export function isWithinAssistantScope(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const blocked = [
    "other city",
    "other municipality",
    "compare to",
    "what should",
    "political",
    "election",
    "legal advice",
    "not in the data",
  ];
  if (blocked.some((term) => lower.includes(term))) return false;
  const allowed = [
    "revenue",
    "expense",
    "debt",
    "rate",
    "customer",
    "consumption",
    "billing",
    "cip",
    "financial",
    "coverage",
    "sufficiency",
    "covenant",
    "fund",
    "budget",
    "allocation",
    "meter",
    "account",
  ];
  return allowed.some((term) => lower.includes(term));
}

/**
 * Suggested response when a prompt is out of scope.
 */
export function outOfScopeMessage(): string {
  return `${AquaVista.assistantName} only answers questions about this project's baseline data and municipal finance. Please ask about uploaded data, rates, revenue, expenses, customer classes, or CIP.`;
}
