import type { DimensionRating } from "@/app/types/audit";
import { dimensionLabel, oneSentence, rating } from "@/lib/report-visuals";

interface LikertGraphProps {
  dimensions: DimensionRating[];
}

export function LikertGraph({ dimensions }: LikertGraphProps) {
  return (
    <figure aria-label="Readiness ratings on a five-point scale" className="flex flex-col">
      <div className="space-y-6">
        {dimensions.map((dimension) => {
          const value = rating(dimension.score);
          const category = value == null ? null : Math.round(value);
          return (
            <div key={dimension.name} aria-label={`${dimensionLabel(dimension.name)}: ${category == null ? "unknown" : `${category} out of 5`}`}>
              <div className="mb-3 flex justify-between gap-3 text-sm"><span className="text-neutral-300">{dimensionLabel(dimension.name)}</span><span className="tabular-nums text-white">{category ?? "—"}</span></div>
              <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((point) => <div key={point} className={`flex h-10 items-center justify-center border text-xs tabular-nums ${category === point ? "border-red-500 bg-red-600 text-white" : "border-neutral-800 bg-neutral-900/50 text-neutral-600"}`}>{point}</div>)}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{oneSentence(dimension.notes, "The explanation for this rating is unconfirmed.", 24)}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between text-[10px] text-neutral-500" aria-hidden="true"><span>1 / Weak</span><span>3 / Conditional</span><span>5 / Strong</span></div>
    </figure>
  );
}
