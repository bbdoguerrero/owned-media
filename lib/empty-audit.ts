import type { AuditInsights } from "@/app/types/audit";

// Missing information stays unknown; these are never sample scores or client facts.
export function createEmptyAudit(): AuditInsights {
  const unknown = "Not provided";
  return {
    assetMatrix: [],
    businessTension: { headline: "Initial business assessment", summary: unknown, coreDifficulty: unknown, targetBehavior: unknown, audience: "Audience to clarify", openQuestions: [] },
    livedMoment: { touchpoint: unknown, frequency: unknown, currentPerception: "Not provided", desiredOutcome: unknown, attentionGap: unknown },
    assetFamilies: (["Recognition", "Data", "Story & Content", "Physical"] as const).map((family) => ({
      family, description: "Confirm an existing asset in this family before proposing a specific activation.", currentUse: "Current use needs confirmation",
      currentUtilization: null, opportunityPotential: null, isPrimaryCandidate: false,
    })),
    familyInsight: "More information is needed to compare these asset families.",
    prioritization: {
      potentialScore: null, readinessScore: null, quadrant: "Needs more information", quadrantAction: "Confirm how this asset is used before assigning scores.",
      potentialBreakdown: ["Audience Contact", "Distinctiveness & Fit", "Audience Utility"].map((name) => ({ name, score: null, notes: unknown })),
      readinessBreakdown: ["Access & Ownership", "Rights & Safeguards", "Delivery & Learning"].map((name) => ({ name, score: null, notes: unknown })),
    },
    pilotCard: { headline: unknown, oneAudience: unknown, oneTouchpoint: unknown, oneChange: unknown, successSignal: unknown, accountableOwner: "Not assigned", guardrail: unknown },
    synthesis: { closingQuote: unknown, strategicSummary: unknown, quickWin: unknown, fullAuditNote: unknown },
    source: "gemini",
  };
}
