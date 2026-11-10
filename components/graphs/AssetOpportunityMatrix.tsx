"use client";

import { useState } from "react";
import type { AssetMatrixItem } from "@/app/types/audit";
import { getMatrixQuadrant, type MatrixQuadrant } from "@/lib/audit-matrix";
import { oneSentence } from "@/lib/report-visuals";

const QUADRANTS: { id: MatrixQuadrant; prefix: string; emphasis: string }[] = [
  { id: "unlock", prefix: "Find the", emphasis: "unlock" },
  { id: "pilot", prefix: "Pilot", emphasis: "now" },
  { id: "monitor", prefix: "Park &", emphasis: "monitor" },
  { id: "support", prefix: "Supporting", emphasis: "role" },
];

export function AssetOpportunityMatrix({ assets }: { assets: AssetMatrixItem[] }) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = assets.find((asset) => asset.name === selectedName)
    ?? assets.find((asset) => getMatrixQuadrant(asset.potentialScore, asset.readinessScore, asset.placement) === "pilot")
    ?? assets[0];
  const unknown = assets.filter((asset) => getMatrixQuadrant(asset.potentialScore, asset.readinessScore, asset.placement) === "unknown");
  const assetButton = (asset: AssetMatrixItem) => (
    <li key={asset.name}>
      <button type="button" className="matrix-asset" aria-pressed={selected?.name === asset.name}
        aria-label={`${asset.name}, potential ${asset.potentialScore ?? "unknown"}, readiness ${asset.readinessScore ?? "unknown"}`}
        onClick={() => setSelectedName(asset.name)}>
        <span className="matrix-dot" aria-hidden="true" /><span>{asset.name}</span>
      </button>
    </li>
  );

  if (!assets.some((asset) => getMatrixQuadrant(asset.potentialScore, asset.readinessScore, asset.placement) !== "unknown")) {
    return (
      <div className="mt-5">
        <p className="mb-4 text-xs text-neutral-500">Readiness to confirm</p>
        {assets.length ? <ul className="grid gap-x-6 sm:grid-cols-2">{assets.map(assetButton)}</ul> : null}
        <p className="mt-4 border-t border-neutral-800 pt-4 text-sm leading-relaxed text-neutral-400">{oneSentence(selected?.nextStep, "Confirm which existing asset meets the audience in this moment.")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="asset-matrix" aria-label="Assets grouped by potential and readiness">
        <span className="matrix-potential" aria-hidden="true">Potential ↑</span>
        <span className="matrix-readiness" aria-hidden="true">Readiness →</span>
        <div className="matrix-grid">
          {QUADRANTS.map(({ id, prefix, emphasis }) => {
            const items = assets.filter((asset) => getMatrixQuadrant(asset.potentialScore, asset.readinessScore, asset.placement) === id);
            return (
              <section key={id} className="matrix-quadrant" aria-labelledby={`matrix-${id}`}>
                <h3 id={`matrix-${id}`} className="matrix-heading">{prefix} <span>{emphasis}</span></h3>
                <ul className="matrix-assets">
                  {items.map(assetButton)}
                </ul>
                {items.length === 0 && <p className="matrix-empty">No assets mapped</p>}
              </section>
            );
          })}
        </div>
      </div>
      {unknown.length > 0 && <div className="border-t border-neutral-800 py-4"><h3 className="eyebrow mb-2">Needs more information</h3><ul className="grid gap-x-6 sm:grid-cols-2">{unknown.map(assetButton)}</ul></div>}
      {assets.length === 0 && <p className="py-4 text-sm text-neutral-400">No supported asset assessments are available from these answers.</p>}
      {selected && (
        <div className="matrix-selection" aria-live="polite" aria-atomic="true">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-white">{selected.name}</p>
            <p className="text-sm leading-relaxed text-neutral-400">{oneSentence(selected.nextStep, "Confirm the next useful role for this asset.")}</p>
          </div>
          <p className="shrink-0 text-xs leading-relaxed tabular-nums text-neutral-500">Potential {selected.potentialScore?.toFixed(1) ?? "—"} / 5<br />Readiness {selected.readinessScore?.toFixed(1) ?? "—"} / 5</p>
        </div>
      )}
    </div>
  );
}
