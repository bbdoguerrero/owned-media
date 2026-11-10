"use client";

import { useState } from "react";
import type { AssetMatrixItem } from "@/app/types/audit";
import { getMatrixQuadrant, type MatrixQuadrant } from "@/lib/audit-matrix";

const QUADRANTS: { id: MatrixQuadrant; prefix: string; emphasis: string }[] = [
  { id: "unlock", prefix: "Find the", emphasis: "unlock" },
  { id: "pilot", prefix: "Pilot", emphasis: "now" },
  { id: "monitor", prefix: "Park &", emphasis: "monitor" },
  { id: "support", prefix: "Supporting", emphasis: "role" },
];

export function AssetOpportunityMatrix({ assets }: { assets: AssetMatrixItem[] }) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = assets.find((asset) => asset.name === selectedName)
    ?? assets.find((asset) => getMatrixQuadrant(asset.potentialScore, asset.readinessScore) === "pilot")
    ?? assets[0];

  return (
    <div>
      <div className="asset-matrix" aria-label="Assets grouped by potential and readiness">
        <span className="matrix-potential" aria-hidden="true">Potential ↑</span>
        <span className="matrix-readiness" aria-hidden="true">Readiness →</span>
        <div className="matrix-grid">
          {QUADRANTS.map(({ id, prefix, emphasis }) => {
            const items = assets.filter((asset) => getMatrixQuadrant(asset.potentialScore, asset.readinessScore) === id);
            return (
              <section key={id} className="matrix-quadrant" aria-labelledby={`matrix-${id}`}>
                <h3 id={`matrix-${id}`} className="matrix-heading">{prefix} <span>{emphasis}</span></h3>
                <ul className="matrix-assets">
                  {items.map((asset) => (
                    <li key={asset.name}>
                      <button
                        type="button"
                        className="matrix-asset"
                        aria-pressed={selected?.name === asset.name}
                        aria-label={`${asset.name}, potential ${asset.potentialScore} out of 5, readiness ${asset.readinessScore} out of 5`}
                        onClick={() => setSelectedName(asset.name)}
                      >
                        <span className="matrix-dot" aria-hidden="true" />
                        <span>{asset.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {items.length === 0 && <p className="matrix-empty">No assets mapped</p>}
              </section>
            );
          })}
        </div>
      </div>
      {selected && (
        <div className="matrix-selection" aria-live="polite" aria-atomic="true">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-white">{selected.name}</p>
            <p className="text-sm leading-relaxed text-neutral-400">{selected.nextStep}</p>
          </div>
          <p className="shrink-0 text-xs leading-relaxed tabular-nums text-neutral-500">Potential {selected.potentialScore.toFixed(1)} / 5<br />Readiness {selected.readinessScore.toFixed(1)} / 5</p>
        </div>
      )}
    </div>
  );
}
