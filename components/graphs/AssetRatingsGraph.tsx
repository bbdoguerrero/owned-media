import type { AssetMatrixItem } from "@/app/types/audit";
import { oneSentence, rating } from "@/lib/report-visuals";

export function AssetRatingsGraph({ assets, caption }: { assets: AssetMatrixItem[]; caption: string }) {
  const candidates = [...assets].sort((a, b) => (rating(b.potentialScore) ?? -1) - (rating(a.potentialScore) ?? -1)).slice(0, 6);
  return (
    <figure aria-label="Leading assets compared on potential and readiness out of five">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
        <div className="flex gap-5"><span className="flex items-center gap-2"><span className="h-2 w-4 bg-red-500" />Potential</span><span className="flex items-center gap-2"><span className="h-2 w-4 bg-neutral-500" />Readiness</span></div>
        <span>1–5{assets.length > 6 ? ` / Top 6 of ${assets.length}` : ""}</span>
      </div>
      <div className="space-y-5">
        {candidates.map((asset) => (
          <div key={asset.name} aria-label={`${asset.name}: potential ${rating(asset.potentialScore) ?? "unknown"}, readiness ${rating(asset.readinessScore) ?? "unknown"}`}>
            <p className="mb-2 text-sm text-neutral-300">{asset.name}</p>
            <div className="grid grid-cols-[1fr_2rem] items-center gap-x-3 gap-y-1.5" aria-hidden="true">
              {([{ value: asset.potentialScore, color: "bg-red-500", text: "text-red-400" }, { value: asset.readinessScore, color: "bg-neutral-500", text: "text-neutral-400" }]).map(({ value, color, text }, index) => (
                <div key={index} className="contents"><div className="h-2 bg-neutral-900">{rating(value) != null && <div className={`h-full ${color}`} style={{ width: `${rating(value)! * 20}%` }} />}</div><span className={`text-right text-xs tabular-nums ${text}`}>{rating(value)?.toFixed(1) ?? "—"}</span></div>
              ))}
            </div>
          </div>
        ))}
        {!candidates.length && <div className="flex min-h-40 items-center justify-center border border-dashed border-neutral-800 text-sm text-neutral-500">Assets to confirm</div>}
      </div>
      <figcaption className="mt-6 border-t border-neutral-800 pt-4 text-sm leading-relaxed text-neutral-400">{oneSentence(caption, "Identify the asset that best supports the stated business objective.")}</figcaption>
    </figure>
  );
}
