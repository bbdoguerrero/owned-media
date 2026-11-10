"use client";

import { DimensionRating } from "@/app/types/audit";
import { getMatrixQuadrant } from "@/lib/audit-matrix";

interface PrioritizationMatrixGraphProps {
  potentialScore: number;
  readinessScore: number;
  quadrantAction: string;
  potentialBreakdown: DimensionRating[];
  readinessBreakdown: DimensionRating[];
}

export function PrioritizationMatrixGraph({
  potentialScore,
  readinessScore,
  quadrantAction,
  potentialBreakdown,
  readinessBreakdown,
}: PrioritizationMatrixGraphProps) {
  const shortQuadrant = {
    pilot: "Pilot now", unlock: "Find the unlock", support: "Supporting role", monitor: "Park & monitor",
  }[getMatrixQuadrant(potentialScore, readinessScore)];

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-5">
        {[{ label: "Potential", value: potentialScore }, { label: "Readiness", value: readinessScore }].map(({ label, value }) => (
          <div key={label}>
            <p className="mb-1 text-xs text-neutral-400">{label}</p>
            <p className="text-4xl tabular-nums tracking-tight text-white">{value.toFixed(1)}<span className="ml-1 text-sm text-neutral-500">/ 5</span></p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm text-white">{shortQuadrant}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-400">{quadrantAction}</p>
      <details className="report-details mt-5 border-t border-neutral-800 pt-3">
        <summary className="w-fit cursor-pointer text-xs text-neutral-400 hover:text-white">Score details</summary>
        <div className="mt-4 space-y-5">
          {[{ label: "Potential", dimensions: potentialBreakdown }, { label: "Readiness", dimensions: readinessBreakdown }].map(({ label, dimensions }) => (
            <div key={label}>
              <p className="eyebrow mb-3">{label}</p>
              <dl className="space-y-3">
                {dimensions.map((dimension) => (
                  <div key={dimension.name}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <dt className="text-neutral-300">{dimension.name}</dt>
                      <dd className="tabular-nums text-white">{dimension.score} / 5</dd>
                    </div>
                    <div className="mt-2 h-1 bg-neutral-900" aria-hidden="true"><div className="h-full bg-neutral-500" style={{ width: `${Math.max(0, Math.min(5, dimension.score)) * 20}%` }} /></div>
                    <p className="mt-1 text-xs text-neutral-500">{dimension.notes}</p>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
