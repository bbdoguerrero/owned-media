import type { DimensionRating } from "@/app/types/audit";
import { dimensionLabel, oneSentence, rating } from "@/lib/report-visuals";

interface AssessmentRadarGraphProps {
  potential: DimensionRating[];
  readiness: DimensionRating[];
  caption: string;
}

const POINTS = [
  { name: "Audience Contact", lines: ["Audience", "contact"], x: 180, y: 16 },
  { name: "Distinctiveness & Fit", lines: ["Brand", "fit"], x: 313, y: 82 },
  { name: "Audience Utility", lines: ["Audience", "utility"], x: 313, y: 232 },
  { name: "Access & Ownership", lines: ["Access &", "ownership"], x: 180, y: 296 },
  { name: "Rights & Safeguards", lines: ["Rights &", "safeguards"], x: 47, y: 232 },
  { name: "Delivery & Learning", lines: ["Delivery &", "learning"], x: 47, y: 82 },
];

export function AssessmentRadarGraph({ potential, readiness, caption }: AssessmentRadarGraphProps) {
  const dimensions = [...potential, ...readiness];
  const point = (index: number, distance: number) => {
    const angle = (-90 + index * 60) * Math.PI / 180;
    return { x: 180 + Math.cos(angle) * distance, y: 160 + Math.sin(angle) * distance };
  };
  const values = POINTS.map(({ name }) => {
    const value = rating(dimensions.find((dimension) => dimension.name === name)?.score);
    return value == null ? null : Math.round(value);
  });
  const vertices = values.map((value, index) => value == null ? null : point(index, value / 5 * 98));
  const polygon = (distance: number) => POINTS.map((_, index) => { const p = point(index, distance); return `${p.x},${p.y}`; }).join(" ");
  const complete = vertices.every((vertex) => vertex != null);
  const summary = POINTS.map(({ name }, index) => `${dimensionLabel(name)} ${values[index] == null ? "unknown" : `${values[index]} out of 5`}`).join(", ");

  return (
    <figure aria-label="Potential and readiness radar profile">
      <svg viewBox="0 0 360 346" className="mx-auto w-full max-w-md" role="img" aria-label={summary}>
        {[1, 2, 3, 4, 5].map((level) => <polygon key={level} points={polygon(level / 5 * 98)} fill="none" stroke="#303030" strokeWidth="1" />)}
        {POINTS.map((_, index) => { const p = point(index, 98); return <line key={index} x1="180" y1="160" x2={p.x} y2={p.y} stroke="#303030" />; })}
        {[1, 3, 5].map((level) => <text key={level} x="184" y={160 - level / 5 * 98 + 11} fill="#737373" fontSize="8">{level}</text>)}
        {complete && <polygon points={vertices.map((p) => `${p!.x},${p!.y}`).join(" ")} fill="#ef4444" fillOpacity="0.1" stroke="#d4d4d4" strokeWidth="1.5" />}
        {!complete && vertices.map((p, index) => { const next = vertices[(index + 1) % vertices.length]; return p && next ? <line key={index} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="#d4d4d4" strokeWidth="1.5" /> : null; })}
        {vertices.map((p, index) => p ? <circle key={index} cx={p.x} cy={p.y} r="4" fill={index < 3 ? "#ef4444" : "#d4d4d4"} stroke="#0a0a0a" strokeWidth="1.5" /> : null)}
        {POINTS.map(({ name, lines, x, y }, index) => <text key={name} x={x} y={y} textAnchor="middle" fontSize="10.5" fill={index < 3 ? "#f87171" : "#a3a3a3"}>{lines.map((line, row) => <tspan key={line} x={x} dy={row ? 13 : 0}>{line}</tspan>)}<tspan x={x} dy="15" fill="#fff" fontSize="11">{values[index] ?? "—"}</tspan></text>)}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-neutral-500"><span className="flex items-center gap-2"><span className="h-2 w-2 bg-red-500" />Potential</span><span className="flex items-center gap-2"><span className="h-2 w-2 bg-neutral-300" />Readiness</span><span>— Unconfirmed</span></div>
      <figcaption className="mt-6 border-t border-neutral-800 pt-4 text-sm leading-relaxed text-neutral-400">{oneSentence(caption, "Validate the unscored dimensions before treating this opportunity as ready.")}</figcaption>
    </figure>
  );
}
