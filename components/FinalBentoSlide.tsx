"use client";

import { ArrowRight, FileText, RotateCcw } from "lucide-react";
import type { AuditInsights, UserProfile } from "@/app/types/audit";
import { AssetOpportunityMatrix } from "./graphs/AssetOpportunityMatrix";
import { AssetRatingsGraph } from "./graphs/AssetRatingsGraph";
import { AssessmentRadarGraph } from "./graphs/AssessmentRadarGraph";
import { LikertGraph } from "./graphs/LikertGraph";
import { normalizeAssetMatrix } from "@/lib/audit-matrix";
import { oneSentence, shortLabel } from "@/lib/report-visuals";

interface FinalBentoSlideProps {
  insights: AuditInsights;
  profile: UserProfile;
  onRestart: () => void;
}

export function FinalBentoSlide({ insights, profile, onRestart }: FinalBentoSlideProps) {
  const isDemo = insights.source === "demo";
  const assets = normalizeAssetMatrix(insights.assetMatrix, []);
  const priority = insights.prioritization;
  const measure = oneSentence(insights.pilotCard.successSignal, "Compare the test with the current experience.", 14).replace(/[.!?]+$/, "");
  const guardrail = oneSentence(insights.pilotCard.guardrail, "Confirm access and safeguards before launch.", 14).replace(/^(Approve|Confirm|Keep|Check|Verify|Ensure)/, (word) => word.toLowerCase());
  const pilotCaption = oneSentence(`${measure}; ${guardrail}`, "Agree a comparison and confirm safeguards before testing.", 32);

  return (
    <section className="audit-report mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12" aria-labelledby="report-title">
      <div className="mb-7 flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-3">{isDemo && "Demo / "}{profile.company} / {profile.industry}</p>
          <h1 id="report-title" className="font-gothic text-2xl leading-tight sm:text-4xl">Owned media audit</h1>
        </div>
        <div className="report-actions flex items-center gap-6">
          <button type="button" onClick={() => window.print()} className="text-button"><FileText size={15} aria-hidden="true" /> Save / print</button>
          <button type="button" onClick={onRestart} className="text-button"><RotateCcw size={15} aria-hidden="true" /> {isDemo ? "Start my audit" : "Start again"}</button>
        </div>
      </div>

      <div className="mb-7 max-w-3xl border-l-2 border-red-500 pl-4">
        <h2 className="text-lg font-medium leading-snug text-white">{insights.businessTension.headline}</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">{oneSentence(insights.businessTension.summary, "Use the three answers to identify a useful role for an existing asset.")}</p>
      </div>

      <section className="report-panel mb-6" aria-labelledby="opportunity-matrix-title">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="opportunity-matrix-title" className="font-gothic text-lg sm:text-2xl">Opportunity map</h2>
          <span className="text-[11px] text-neutral-500">{isDemo ? "Illustrative ratings" : "Working assessment"}</span>
        </div>
        <AssetOpportunityMatrix assets={assets} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="report-panel min-w-0 border border-neutral-800 bg-neutral-950 p-5 sm:p-7" aria-labelledby="asset-chart-title">
          <p className="eyebrow mb-3">Your assets / 1–5</p>
          <h2 id="asset-chart-title" className="font-gothic mb-6 text-xl sm:text-2xl">Where to focus</h2>
          <AssetRatingsGraph assets={assets} caption={insights.familyInsight} />
        </section>

        <section className="report-panel min-w-0 border border-neutral-800 bg-neutral-950 p-5 sm:p-7" aria-labelledby="radar-chart-title">
          <div className="flex items-start justify-between gap-4">
            <div><p className="eyebrow mb-3">Framework profile / 1–5</p><h2 id="radar-chart-title" className="font-gothic text-xl sm:text-2xl">Opportunity profile</h2></div>
          </div>
          <AssessmentRadarGraph potential={priority.potentialBreakdown} readiness={priority.readinessBreakdown} caption={priority.quadrantAction} />
        </section>

        <section className="report-panel min-w-0 border border-neutral-800 p-5 sm:p-7" aria-labelledby="likert-chart-title">
          <p className="eyebrow mb-3">Readiness / Five-point scale</p>
          <h2 id="likert-chart-title" className="font-gothic mb-6 text-xl sm:text-2xl">Before you test</h2>
          <LikertGraph dimensions={priority.readinessBreakdown} />
        </section>

        <figure className="report-panel min-w-0 border border-neutral-800 p-5 sm:p-7" aria-labelledby="pilot-title">
          <p className="eyebrow mb-3">Suggested pilot</p>
          <h2 id="pilot-title" className="font-gothic mb-6 text-xl sm:text-2xl">One small test</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { number: "1", label: "Audience", value: insights.pilotCard.oneAudience },
              { number: "2", label: "Touchpoint", value: insights.pilotCard.oneTouchpoint },
              { number: "3", label: "Change", value: insights.pilotCard.oneChange },
            ].map(({ number, label, value }) => <div key={number} className="border-t border-neutral-700 pt-3"><span className="text-3xl tabular-nums text-red-500">{number}</span><h3 className="mb-2 mt-3 text-[11px] text-neutral-500">{label}</h3><p className="text-sm leading-relaxed text-neutral-300">{shortLabel(value)}</p></div>)}
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500"><ArrowRight size={14} className="shrink-0 text-red-500" aria-hidden="true" /><span>Owner / {insights.pilotCard.accountableOwner === "Not assigned" ? "To confirm" : shortLabel(insights.pilotCard.accountableOwner)}</span></div>
          <figcaption className="mt-6 border-t border-neutral-800 pt-4 text-sm leading-relaxed text-neutral-400">{pilotCaption}</figcaption>
        </figure>
      </div>
      <p className="mt-6 text-[11px] text-neutral-500">{isDemo ? "Illustrative demo only." : "Initial assessments from your answers; — means unconfirmed."}</p>
    </section>
  );
}
