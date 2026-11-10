import type { AssetMatrixItem } from "@/app/types/audit";

export type MatrixQuadrant = "unlock" | "pilot" | "monitor" | "support" | "unknown";

export function getMatrixQuadrant(potential: number | null, readiness: number | null, placement?: MatrixQuadrant): MatrixQuadrant {
  if (potential == null || readiness == null) return "unknown";
  if (placement) return placement;
  // Legacy/demo layout only. Live assessments supply a relative placement.
  if (potential >= 3) return readiness >= 3 ? "pilot" : "unlock";
  return readiness >= 3 ? "support" : "monitor";
}

export function normalizeAssetMatrix(value: unknown, fallback: AssetMatrixItem[]): AssetMatrixItem[] {
  if (!Array.isArray(value)) return fallback;
  const seen = new Set<string>();
  const result: AssetMatrixItem[] = [];

  for (const item of value) {
    if (!item || typeof item.name !== "string" || !item.name.trim()) continue;
    const name = item.name.trim().split(/\s+/).slice(0, 5).join(" ").slice(0, 60);
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    result.push({
      name,
      potentialScore: typeof item.potentialScore === "number" && Number.isFinite(item.potentialScore) ? Math.max(1, Math.min(5, item.potentialScore)) : null,
      readinessScore: typeof item.readinessScore === "number" && Number.isFinite(item.readinessScore) ? Math.max(1, Math.min(5, item.readinessScore)) : null,
      nextStep: typeof item.nextStep === "string" && item.nextStep.trim()
        ? item.nextStep.trim().slice(0, 160) : "Review this asset with its owner.",
      evidence: typeof item.evidence === "string" ? item.evidence.trim() : undefined,
      answerRefs: Array.isArray(item.answerRefs) ? item.answerRefs.filter((ref: unknown) => typeof ref === "string" && ["q1", "q2", "q3"].includes(ref)) : undefined,
      placement: ["unlock", "pilot", "monitor", "support", "unknown"].includes(item.placement) ? item.placement : undefined,
    });
    if (result.length === 16) break;
  }
  return result.length ? result : fallback;
}
