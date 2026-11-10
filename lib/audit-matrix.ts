import type { AssetMatrixItem, AuditInsights } from "@/app/types/audit";

export type MatrixQuadrant = "unlock" | "pilot" | "monitor" | "support";

export function getMatrixQuadrant(potential: number, readiness: number): MatrixQuadrant {
  if (potential >= 3) return readiness >= 3 ? "pilot" : "unlock";
  return readiness >= 3 ? "support" : "monitor";
}

export function createFallbackMatrix(
  inventory: string,
  prioritization: AuditInsights["prioritization"],
): AssetMatrixItem[] {
  const names = inventory.split(/[,;\n]+|\s+(?:and|&)\s+/i)
    .map((name) => name.trim().split(/\s+/).slice(0, 5).join(" ")).filter(Boolean);
  return [...new Set(names)].slice(0, 16).map((name) => ({
    name,
    potentialScore: prioritization.potentialScore,
    readinessScore: prioritization.readinessScore,
    nextStep: prioritization.quadrantAction,
  }));
}

export function normalizeAssetMatrix(value: unknown, fallback: AssetMatrixItem[]): AssetMatrixItem[] {
  if (!Array.isArray(value)) return fallback;
  const seen = new Set<string>();
  const result: AssetMatrixItem[] = [];

  for (const item of value) {
    if (!item || typeof item.name !== "string" || !item.name.trim()
      || typeof item.potentialScore !== "number" || !Number.isFinite(item.potentialScore)
      || typeof item.readinessScore !== "number" || !Number.isFinite(item.readinessScore)) continue;
    const name = item.name.trim().split(/\s+/).slice(0, 5).join(" ").slice(0, 60);
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    result.push({
      name,
      potentialScore: Math.max(1, Math.min(5, item.potentialScore)),
      readinessScore: Math.max(1, Math.min(5, item.readinessScore)),
      nextStep: typeof item.nextStep === "string" && item.nextStep.trim()
        ? item.nextStep.trim().slice(0, 160) : "Review this asset with its owner.",
    });
    if (result.length === 16) break;
  }
  return result.length ? result : fallback;
}
