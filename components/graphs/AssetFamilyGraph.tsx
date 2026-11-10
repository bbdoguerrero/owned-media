"use client";

import { AssetFamilyScore } from "@/app/types/audit";

interface AssetFamilyGraphProps {
  families: AssetFamilyScore[];
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function AssetFamilyGraph({ families }: AssetFamilyGraphProps) {
  return (
    <figure className="w-full" aria-label="Current use and potential across four asset families">
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-400" aria-hidden="true">
        <span className="flex items-center gap-2"><span className="h-2 w-5 bg-neutral-600" />Current use</span>
        <span className="flex items-center gap-2"><span className="h-2 w-5 bg-red-500" />Potential</span>
      </div>

      <div className="space-y-7">
        {families.map((item) => (
          <div key={item.family} aria-label={`${item.family}: current use ${item.currentUtilization}%, potential ${item.opportunityPotential}%${item.isPrimaryCandidate ? ", suggested focus" : ""}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <span className="text-sm text-white">{item.family}</span>
              {item.isPrimaryCandidate && <span className="text-xs text-red-400">Start here</span>}
            </div>
            <div className="grid grid-cols-[1fr_2.75rem] items-center gap-x-3 gap-y-2" aria-hidden="true">
              <div className="h-2 bg-neutral-900"><div className="h-full bg-neutral-600" style={{ width: `${clamp(item.currentUtilization)}%` }} /></div>
              <span className="text-right text-xs tabular-nums text-neutral-400">{item.currentUtilization}%</span>
              <div className="h-2 bg-neutral-900"><div className="h-full bg-red-500" style={{ width: `${clamp(item.opportunityPotential)}%` }} /></div>
              <span className="text-right text-xs tabular-nums text-red-400">{item.opportunityPotential}%</span>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-8 text-xs text-neutral-500">Directional estimates from your answers.</figcaption>
    </figure>
  );
}
