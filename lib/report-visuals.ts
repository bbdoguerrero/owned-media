export function rating(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5 ? value : null;
}

export function oneSentence(value: string | undefined, fallback: string, limit = 28): string {
  const text = value?.trim() && !/^(not provided|unknown|not assigned)$/i.test(value.trim()) ? value.trim() : fallback;
  const first = [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(text)][0]?.segment.trim() ?? text;
  const words = first.replace(/\s+/g, " ").split(" ");
  const sentence = words.slice(0, limit).join(" ").replace(/[.…]+$/, "");
  return /[!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

export function shortLabel(value: string, limit = 9): string {
  const words = value.trim().replace(/[.!?]+$/, "").split(/\s+/);
  return words.length > limit ? `${words.slice(0, limit).join(" ")}…` : words.join(" ");
}

export function dimensionLabel(name: string): string {
  return ({
    "Audience Contact": "Audience contact",
    "Distinctiveness & Fit": "Brand fit",
    "Audience Utility": "Audience utility",
    "Access & Ownership": "Access & ownership",
    "Rights & Safeguards": "Rights & safeguards",
    "Delivery & Learning": "Delivery & learning",
  } as Record<string, string>)[name] ?? name;
}

