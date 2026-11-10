import type { AssetFamilyScore, AuditInsights, DimensionRating } from "@/app/types/audit";
import { getMatrixQuadrant, normalizeAssetMatrix } from "./audit-matrix";

export const REPORT_STANDARD = {
  families: ["Recognition", "Data", "Story & Content", "Physical"],
  headlineWords: 6,
  summaryWords: 20,
  fieldWords: 12,
  dimensionNoteWords: 6,
  assetNameWords: 5,
  maxAssets: 16,
  scoreMin: 1,
  scoreMax: 5,
  highScore: 3,
} as const;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}

function shortText(value: unknown, fallback: string, limit: number): string {
  const text = typeof value === "string" && value.trim() ? value.trim() : fallback;
  const words = text.replace(/\s+/g, " ").split(" ");
  return words.length > limit ? `${words.slice(0, limit).join(" ").replace(/[,.!?:;]$/, "")}…` : words.join(" ");
}

function score(value: unknown, fallback: number, max = 5): number {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
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

function dimensions(value: unknown, fallback: DimensionRating[]): DimensionRating[] {
  const list = Array.isArray(value) ? value.map(record) : [];
  return fallback.map((dimension) => {
    const item = list.find((item) => item.name === dimension.name) ?? {};
    return {
      name: dimension.name,
      score: score(item.score, dimension.score),
      notes: shortText(item.notes, dimension.notes, REPORT_STANDARD.dimensionNoteWords),
    };
  });
}

// Keep the report's shape stable. Only client-specific content and scores vary.
export function standardizeAuditReport(value: unknown, fallback: AuditInsights): AuditInsights {
  const data = record(value);
  const priority = record(data.prioritization);
  const potentialScore = score(priority.potentialScore, fallback.prioritization.potentialScore);
  const readinessScore = score(priority.readinessScore, fallback.prioritization.readinessScore);
  const quadrant = {
    pilot: "Shape a Pilot Now", unlock: "Name the Unlock", support: "Supporting Role", monitor: "Park It",
  } as const;
  const rawFamilies = Array.isArray(data.assetFamilies) ? data.assetFamilies.map(record) : [];
  const primary = rawFamilies.find((family) => family.isPrimaryCandidate === true && REPORT_STANDARD.families.some((name) => name === family.family))?.family
    ?? fallback.assetFamilies.find((family) => family.isPrimaryCandidate)?.family;
  const assetFamilies: AssetFamilyScore[] = REPORT_STANDARD.families.map((family) => {
    const base = fallback.assetFamilies.find((item) => item.family === family)!;
    const item = rawFamilies.find((item) => item.family === family) ?? {};
    return {
      family,
      description: shortText(item.description, base.description, REPORT_STANDARD.fieldWords),
      currentUtilization: Math.round(score(item.currentUtilization, base.currentUtilization, 100)),
      opportunityPotential: Math.round(score(item.opportunityPotential, base.opportunityPotential, 100)),
      isPrimaryCandidate: primary === family,
    };
  });
  const moment = textFields(data.livedMoment, fallback.livedMoment);
  const perceptions = ["Ignored", "Transactional", "Friction", "Under-measured"];

  return {
    assetMatrix: normalizeAssetMatrix(data.assetMatrix, fallback.assetMatrix).map((asset) => ({
      ...asset,
      name: shortText(asset.name, asset.name, REPORT_STANDARD.assetNameWords),
      nextStep: shortText(asset.nextStep, asset.nextStep, REPORT_STANDARD.fieldWords),
      potentialScore: score(asset.potentialScore, 3),
      readinessScore: score(asset.readinessScore, 3),
    })),
    businessTension: textFields(data.businessTension, fallback.businessTension, {
      headline: REPORT_STANDARD.headlineWords, summary: REPORT_STANDARD.summaryWords,
    }),
    livedMoment: { ...moment, currentPerception: perceptions.includes(moment.currentPerception) ? moment.currentPerception : fallback.livedMoment.currentPerception },
    assetFamilies,
    familyInsight: shortText(data.familyInsight, fallback.familyInsight, REPORT_STANDARD.fieldWords),
    prioritization: {
      potentialScore, readinessScore,
      quadrant: quadrant[getMatrixQuadrant(potentialScore, readinessScore)],
      quadrantAction: shortText(priority.quadrantAction, fallback.prioritization.quadrantAction, REPORT_STANDARD.fieldWords),
      potentialBreakdown: dimensions(priority.potentialBreakdown, fallback.prioritization.potentialBreakdown),
      readinessBreakdown: dimensions(priority.readinessBreakdown, fallback.prioritization.readinessBreakdown),
    },
    pilotCard: textFields(data.pilotCard, fallback.pilotCard),
    synthesis: textFields(data.synthesis, fallback.synthesis),
    source: fallback.source,
  };
}
