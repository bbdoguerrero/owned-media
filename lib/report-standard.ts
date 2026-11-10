import type { AssetFamilyScore, AuditInsights, DimensionRating } from "@/app/types/audit";
import { normalizeAssetMatrix } from "./audit-matrix";

export const REPORT_STANDARD = {
  families: ["Recognition", "Data", "Story & Content", "Physical"],
  headlineWords: 8,
  summaryWords: 36,
  fieldWords: 12,
  dimensionNoteWords: 24,
  assetNameWords: 5,
  familyDescriptionWords: 28,
  maxAssets: 16,
  scoreMin: 1,
  scoreMax: 5,
} as const;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}

function shortText(value: unknown, fallback: string, limit: number): string {
  const text = typeof value === "string" && value.trim() ? value.trim() : fallback;
  const words = text.replace(/\s+/g, " ").split(" ");
  return words.length > limit ? `${words.slice(0, limit).join(" ").replace(/[,.!?:;]$/, "")}…` : words.join(" ");
}

function score(value: unknown, fallback: number | null, max = 5): number | null {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  if (number == null) return null;
  return Math.round(Math.max(max === 5 ? 1 : 0, Math.min(max, number)) * 10) / 10;
}

function textFields<T extends Record<string, string>>(
  value: unknown, fallback: T, limits: Partial<Record<keyof T, number>> = {},
): T {
  const data = record(value);
  return Object.fromEntries(Object.entries(fallback).map(([key, text]) => [
    key, shortText(data[key], text, limits[key as keyof T] ?? REPORT_STANDARD.fieldWords),
  ])) as T;
}

function dimensions(value: unknown, fallback: DimensionRating[], inputs?: string[]): DimensionRating[] {
  const list = Array.isArray(value) ? value.map(record) : [];
  return fallback.map((dimension) => {
    const item = list.find((item) => item.name === dimension.name) ?? {};
    const refs = answerRefs(item.answerRefs, inputs, ["q2", "q3"]);
    const value = score(item.score, dimension.score);
    return {
      name: dimension.name,
      score: inputs && (!meaningful(item.notes) || !refs.length) ? null : value == null ? null : Math.round(value),
      notes: shortText(item.notes, dimension.notes, REPORT_STANDARD.dimensionNoteWords),
      evidence: supportedExcerpt(item.evidence, inputs),
      answerRefs: refs,
    };
  });
}

function supportedExcerpt(value: unknown, inputs?: string[]): string | undefined {
  if (typeof value !== "string" || value.trim().length < 3) return undefined;
  const quote = value.trim().replace(/\s+/g, " ");
  const comparable = (text: string) => text.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").toLowerCase();
  return !inputs || inputs.some((input) => comparable(input).includes(comparable(quote))) ? quote : undefined;
}

function answerRefs(value: unknown, inputs?: string[], defaults: string[] = []): string[] {
  const refs = Array.isArray(value) ? value.filter((ref): ref is string => ["q1", "q2", "q3"].includes(ref)) : [];
  return [...new Set(refs.length ? refs : defaults)].filter((ref) => !inputs || Boolean(inputs[Number(ref.slice(1)) - 1]?.trim()));
}

function questions(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 3).map((item) => shortText(item, "", 18)) : [];
}

function meaningful(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim()) && !/^(not (provided|assigned)|unknown|n\/?a)[.!]?$/i.test(value.trim());
}

// Canonical asset names and paraphrases are allowed, but they must remain anchored
// to the supplied inventory. A verbatim quote is optional supporting context.
function inventorySupports(name: string, evidence: unknown, inputs: string[]): boolean {
  const words = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter((word) => word.length >= 3).map((word) => word.replace(/s$/, "")) ?? [];
  const inventory = new Set(words([inputs[1], supportedExcerpt(evidence, inputs)].filter(Boolean).join(" ")));
  return words(name).some((word) => inventory.has(word));
}

function providedPercentage(value: unknown, evidence: string | undefined): number | null {
  if (!evidence || typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) return null;
  const percentages = [...evidence.matchAll(/(\d+(?:\.\d+)?)\s*(?:%|percent\b)/gi)].map((match) => Number(match[1]));
  return percentages.includes(value) ? value : null;
}

// Interpret the answers using the framework. Exact quotes support the assessment;
// they are not a prerequisite for producing a working hypothesis or proposed test.
export function standardizeAuditReport(value: unknown, fallback: AuditInsights, inputs?: string[]): AuditInsights {
  const data = record(value);
  const priority = record(data.prioritization);
  const business = record(data.businessTension);
  const potentialScore = score(priority.potentialScore, fallback.prioritization.potentialScore);
  const readinessScore = score(priority.readinessScore, fallback.prioritization.readinessScore);
  const validQuadrants = ["Shape a Pilot Now", "Name the Unlock", "Supporting Role", "Park It", "Needs more information"];
  const quadrant = potentialScore == null || readinessScore == null ? "Needs more information"
    : validQuadrants.includes(String(priority.quadrant)) ? priority.quadrant as AuditInsights["prioritization"]["quadrant"]
    : fallback.prioritization.quadrant;
  const rawFamilies = Array.isArray(data.assetFamilies) ? data.assetFamilies.map(record) : [];
  const primary = rawFamilies.find((family) => family.isPrimaryCandidate === true && REPORT_STANDARD.families.some((name) => name === family.family))?.family
    ?? fallback.assetFamilies.find((family) => family.isPrimaryCandidate)?.family;
  const assetFamilies: AssetFamilyScore[] = REPORT_STANDARD.families.map((family) => {
    const base = fallback.assetFamilies.find((item) => item.family === family)!;
    const item = rawFamilies.find((item) => item.family === family) ?? {};
    const evidence = supportedExcerpt(item.evidence, inputs);
    return {
      family,
      description: shortText(item.description, base.description, REPORT_STANDARD.familyDescriptionWords),
      currentUse: shortText(item.currentUse, base.currentUse ?? "Current use needs confirmation", 18),
      currentUtilization: inputs ? providedPercentage(item.currentUtilization, evidence ?? inputs[1]) : score(item.currentUtilization, base.currentUtilization, 100),
      opportunityPotential: inputs ? providedPercentage(item.opportunityPotential, evidence ?? inputs[1]) : score(item.opportunityPotential, base.opportunityPotential, 100),
      isPrimaryCandidate: primary === family,
      evidence,
      answerRefs: answerRefs(item.answerRefs, inputs, ["q2", "q3"]),
    };
  });
  const moment = textFields(data.livedMoment, fallback.livedMoment);
  const pilot = textFields(data.pilotCard, fallback.pilotCard);
  if (inputs && !inputs.some((input) => input.toLowerCase().includes(pilot.accountableOwner.toLowerCase()))) pilot.accountableOwner = "Not assigned";
  const perceptions = ["Ignored", "Transactional", "Friction", "Under-measured", "Not provided"];
  const tension = textFields(business, {
    headline: "Initial business assessment",
    summary: inputs?.[0] ?? fallback.businessTension.summary,
    coreDifficulty: fallback.businessTension.coreDifficulty,
    targetBehavior: fallback.businessTension.targetBehavior,
  }, { headline: REPORT_STANDARD.headlineWords, summary: REPORT_STANDARD.summaryWords, coreDifficulty: 24 });
  const hypothesis = shortText(business.opportunityHypothesis,
    meaningful(pilot.oneChange) ? pilot.oneChange : "Clarify which existing asset could help change the desired behavior.", 36);
  const openQuestions = questions(business.openQuestions);

  return {
    assetMatrix: normalizeAssetMatrix(data.assetMatrix, fallback.assetMatrix)
      .filter((asset) => !inputs || inventorySupports(asset.name, asset.evidence, inputs))
      .map((asset) => ({
        ...asset,
        name: shortText(asset.name, asset.name, REPORT_STANDARD.assetNameWords),
        nextStep: shortText(asset.nextStep, asset.nextStep, REPORT_STANDARD.fieldWords),
        potentialScore: score(asset.potentialScore, null),
        readinessScore: score(asset.readinessScore, null),
        placement: inputs ? asset.placement ?? "unknown" : asset.placement,
        evidence: supportedExcerpt(asset.evidence, inputs),
        answerRefs: answerRefs(asset.answerRefs, inputs, ["q2", "q3"]),
      })),
    businessTension: {
      ...tension,
      audience: shortText(business.audience, fallback.businessTension.audience ?? "Audience to clarify", 14),
      opportunityHypothesis: hypothesis,
      openQuestions: openQuestions.length ? openQuestions : ["What evidence would show the desired behavior changed?"],
      evidence: supportedExcerpt(business.evidence, inputs) ?? inputs?.[0],
      answerRefs: answerRefs(business.answerRefs, inputs, ["q1"]),
    },
    livedMoment: { ...moment, currentPerception: perceptions.includes(moment.currentPerception) ? moment.currentPerception : fallback.livedMoment.currentPerception },
    assetFamilies,
    familyInsight: shortText(data.familyInsight, fallback.familyInsight, REPORT_STANDARD.fieldWords),
    prioritization: {
      potentialScore, readinessScore, quadrant,
      evidence: supportedExcerpt(priority.evidence, inputs),
      openQuestions: questions(priority.openQuestions),
      quadrantAction: shortText(priority.quadrantAction, fallback.prioritization.quadrantAction, REPORT_STANDARD.fieldWords),
      potentialBreakdown: dimensions(priority.potentialBreakdown, fallback.prioritization.potentialBreakdown, inputs),
      readinessBreakdown: dimensions(priority.readinessBreakdown, fallback.prioritization.readinessBreakdown, inputs),
    },
    pilotCard: pilot,
    synthesis: textFields(data.synthesis, fallback.synthesis),
    source: fallback.source,
  };
}

export function hasInitialAssessment(report: AuditInsights): boolean {
  return meaningful(report.businessTension.summary)
    && meaningful(report.businessTension.targetBehavior)
    && meaningful(report.businessTension.opportunityHypothesis)
    && meaningful(report.pilotCard.oneChange);
}
