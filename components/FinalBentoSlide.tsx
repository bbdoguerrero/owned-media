"use client";

import { ArrowRight, FileText, RotateCcw } from "lucide-react";
import { AuditInsights, UserProfile } from "@/app/types/audit";
import { AssetFamilyGraph } from "./graphs/AssetFamilyGraph";
import { PrioritizationMatrixGraph } from "./graphs/PrioritizationMatrixGraph";
import { AssetOpportunityMatrix } from "./graphs/AssetOpportunityMatrix";
import { createFallbackMatrix, normalizeAssetMatrix } from "@/lib/audit-matrix";

interface FinalBentoSlideProps {
  insights: AuditInsights;
  profile: UserProfile;
  onRestart: () => void;
}

export function FinalBentoSlide({ insights, profile, onRestart }: FinalBentoSlideProps) {
  const isDemo = insights.source === "demo";
  const matrixAssets = normalizeAssetMatrix(insights.assetMatrix, createFallbackMatrix(insights.pilotCard.oneTouchpoint, insights.prioritization));
  return (
    <section className="audit-report mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14" aria-labelledby="report-title">
      <div className="mb-9 flex flex-col justify-between gap-5 border-b border-neutral-800 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-3">{isDemo && "Demo / "}{profile.company} / {profile.industry}</p>
          <h1 id="report-title" className="font-gothic text-2xl leading-tight sm:text-4xl">Owned media audit</h1>
        </div>
        <div className="report-actions flex items-center gap-6">
          <button type="button" onClick={() => window.print()} className="text-button"><FileText size={15} aria-hidden="true" /> Save / print</button>
          <button type="button" onClick={onRestart} className="text-button"><RotateCcw size={15} aria-hidden="true" /> {isDemo ? "Start my audit" : "Start again"}</button>
        </div>
      </div>

      <section className="report-panel mb-10" aria-labelledby="opportunity-matrix-title">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="opportunity-matrix-title" className="font-gothic text-lg sm:text-2xl">Your asset opportunities</h2>
          <p className="text-xs text-neutral-500">{isDemo ? "Illustrative placements" : "Based on your answers"}</p>
        </div>
        <AssetOpportunityMatrix assets={matrixAssets} />
      </section>

      <div className="mb-10 max-w-3xl border-l-2 border-red-500 pl-5">
        <p className="eyebrow mb-3">Your business focus</p>
        <h2 className="text-xl font-medium leading-snug text-white sm:text-2xl">{insights.businessTension.headline}</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">{insights.businessTension.summary}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="report-panel min-w-0 border border-neutral-800 bg-neutral-950 p-5 sm:p-7 lg:col-span-7" aria-labelledby="asset-chart-title">
          <p className="eyebrow mb-3">01 / Your assets</p>
          <h2 id="asset-chart-title" className="font-gothic mb-7 text-xl sm:text-2xl">Where to focus</h2>
          <AssetFamilyGraph families={insights.assetFamilies} />
          <p className="mt-5 border-t border-neutral-800 pt-4 text-sm leading-relaxed text-neutral-300">{insights.familyInsight}</p>
        </section>

        <section className="report-panel min-w-0 border border-neutral-800 bg-neutral-950 p-5 sm:p-7 lg:col-span-5" aria-labelledby="priority-chart-title">
          <p className="eyebrow mb-3">02 / Your opportunity</p>
          <h2 id="priority-chart-title" className="font-gothic mb-7 text-xl sm:text-2xl">Your first move</h2>
          <PrioritizationMatrixGraph {...insights.prioritization} />
        </section>

        <section className="report-panel min-w-0 border border-neutral-800 p-5 sm:p-7 lg:col-span-12" aria-labelledby="moment-title">
          <p className="eyebrow mb-3">03 / The moment that matters</p>
          <h2 id="moment-title" className="mb-6 text-lg font-medium text-white">{insights.livedMoment.touchpoint}</h2>
          <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-8">
            <div className="border-l-2 border-neutral-600 pl-4">
              <p className="mb-2 text-xs text-neutral-500">Now</p>
              <p className="text-base text-neutral-300">{insights.livedMoment.currentPerception}</p>
            </div>
            <ArrowRight size={22} className="rotate-90 text-red-500 sm:rotate-0" aria-hidden="true" />
            <div className="border-l-2 border-red-500 pl-4">
              <p className="mb-2 text-xs text-neutral-500">Next</p>
              <p className="text-base text-white">{insights.livedMoment.desiredOutcome}</p>
            </div>
          </div>
        </section>

        <section className="report-panel min-w-0 border border-neutral-800 p-5 sm:p-7 lg:col-span-12" aria-labelledby="pilot-title">
          <p className="eyebrow mb-3">04 / Start small</p>
          <h2 id="pilot-title" className="font-gothic text-xl sm:text-2xl">Your first test</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              { number: "1", label: "Audience", value: insights.pilotCard.oneAudience },
              { number: "2", label: "Touchpoint", value: insights.pilotCard.oneTouchpoint },
              { number: "3", label: "Change", value: insights.pilotCard.oneChange },
            ].map(({ number, label, value }) => (
              <div key={number} className="border-t border-neutral-700 pt-4">
                <div className="mb-3 flex items-baseline gap-3"><span className="text-2xl text-red-500">{number}</span><h3 className="text-xs text-neutral-400">{label}</h3></div>
                <p className="text-sm leading-relaxed text-white">{value}</p>
              </div>
            ))}
          </div>
          <dl className="mt-7 grid gap-5 border-t border-neutral-800 pt-5 text-sm sm:grid-cols-3 sm:gap-8">
            {[
              { label: "Measure", value: insights.pilotCard.successSignal },
              { label: "Owner", value: insights.pilotCard.accountableOwner },
              { label: "Keep in mind", value: insights.pilotCard.guardrail },
            ].map(({ label, value }) => (
              <div key={label}><dt className="mb-2 text-xs text-neutral-500">{label}</dt><dd className="leading-relaxed text-neutral-300">{value}</dd></div>
            ))}
          </dl>
        </section>
      </div>

      <div className="mt-8 flex items-start gap-4 border-t border-neutral-800 pt-6">
        <ArrowRight size={20} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
        <div><h2 className="mb-2 text-xs text-neutral-500">This week</h2><p className="text-base leading-relaxed text-white">{insights.synthesis.quickWin}</p></div>
      </div>
      <p className="mt-7 text-xs text-neutral-500">{isDemo ? "Demo data, not a live Globe audit." : insights.source === "gemini" ? "AI-assisted estimates. Validate with a small test." : "Starting estimates. Validate with a small test."}</p>
    </section>
  );
}
