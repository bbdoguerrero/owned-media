"use client";

import { AssetFamilyScore } from "@/app/types/audit";

interface AssetFamilyGraphProps {
  families: AssetFamilyScore[];
  isDemo?: boolean;
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function AssetFamilyGraph({ families, isDemo = false }: AssetFamilyGraphProps) {
  const hasPercentages = families.some((family) => family.currentUtilization != null || family.opportunityPotential != null);
  return (
    <figure className="w-full" aria-label="Current use and potential across four asset families">
      {hasPercentages && <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-400" aria-hidden="true">
        <span className="flex items-center gap-2"><span className="h-2 w-5 bg-neutral-600" />Current use</span>
        <span className="flex items-center gap-2"><span className="h-2 w-5 bg-red-500" />Potential</span>
      </div>}
      <p className="mb-7 text-sm leading-relaxed text-neutral-400">{hasPercentages ? "Potential estimates how useful each asset could become; the gap from current use shows the opportunity." : "How the assets you described could help address the business tension."}</p>

      <div className="space-y-7">
        {families.map((item) => (
          <div key={item.family} aria-label={`${item.family}: current use ${item.currentUtilization == null ? "not quantified" : `${item.currentUtilization}%`}, potential ${item.opportunityPotential == null ? "not quantified" : `${item.opportunityPotential}%`}${item.isPrimaryCandidate ? ", suggested focus" : ""}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <span className="text-sm text-white">{item.family}</span>
              {item.isPrimaryCandidate && <span className="text-xs text-red-400">Start here</span>}
            </div>
            {item.currentUtilization != null || item.opportunityPotential != null ? <div className="grid grid-cols-[1fr_2.75rem] items-center gap-x-3 gap-y-2" aria-hidden="true">
              <div className="h-2 bg-neutral-900">{item.currentUtilization != null && <div className="h-full bg-neutral-600" style={{ width: `${clamp(item.currentUtilization)}%` }} />}</div>
              <span className="text-right text-xs tabular-nums text-neutral-400">{item.currentUtilization == null ? "—" : `${item.currentUtilization}%`}</span>
              <div className="h-2 bg-neutral-900">{item.opportunityPotential != null && <div className="h-full bg-red-500" style={{ width: `${clamp(item.opportunityPotential)}%` }} />}</div>
              <span className="text-right text-xs tabular-nums text-red-400">{item.opportunityPotential == null ? "—" : `${item.opportunityPotential}%`}</span>
            </div> : <p className="text-xs leading-relaxed text-neutral-400"><span className="text-neutral-500">Current role: </span>{item.currentUse ?? "Current use needs confirmation"}</p>}
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">{item.description}</p>
          </div>
        ))}
      </div>
      <figcaption className="mt-8 text-xs text-neutral-500">{isDemo ? "Illustrative demo values." : hasPercentages ? "Percentages appear only when provided in your answers; — means not quantified." : "Initial qualitative assessment, not measured utilization or performance."}</figcaption>
    </figure>
  );
}
