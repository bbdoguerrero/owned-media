"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { AuditInsights, UserProfile, UserResponses } from "@/app/types/audit";

interface ProcessingSlideProps {
  onComplete: (insights: AuditInsights, ownedMediaThought: string) => void;
  payload: UserProfile & UserResponses;
}

const PERSPECTIVES = ["Underused", "Split across teams", "Mostly functional", "Ready to grow"];

async function generateInsights(payload: UserProfile & UserResponses, signal: AbortSignal) {
  const response = await fetch("/api/generate-insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!response.ok) throw new Error("Unable to build report");
  return response.json() as Promise<AuditInsights>;
}

export function ProcessingSlide({ onComplete, payload }: ProcessingSlideProps) {
  const [selectedPerspective, setSelectedPerspective] = useState("");
  const [customThought, setCustomThought] = useState("");
  const [insights, setInsights] = useState<AuditInsights | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const finalRequest = useRef<AbortController | null>(null);
  const { name, email, company, industry, position, q1, q2, q3 } = payload;

  useEffect(() => {
    const controller = new AbortController();

    generateInsights({ name, email, company, industry, position, q1, q2, q3 }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setInsights(result);
        setStatus("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setStatus("error");
      });

    return () => controller.abort();
  }, [name, email, company, industry, position, q1, q2, q3, attempt]);

  useEffect(() => () => finalRequest.current?.abort(), []);

  const handleFinish = async () => {
    if (!insights || isFinishing) return;
    const thought = [selectedPerspective, customThought.trim()].filter(Boolean).join(" — ");
    if (!thought) {
      onComplete(insights, "");
      return;
    }

    setIsFinishing(true);
    setError("");
    const controller = new AbortController();
    finalRequest.current = controller;

    try {
      // Submit the latest input once, when the user is ready, rather than on each edit.
      const result = await generateInsights({ ...payload, ownedMediaThought: thought }, controller.signal);
      if (!controller.signal.aborted) onComplete(result, thought);
    } catch {
      if (!controller.signal.aborted) {
        setError("We couldn’t add your thoughts. Please try again.");
        setIsFinishing(false);
      }
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col px-5 py-14 sm:px-8 sm:py-20" aria-labelledby="waiting-title">
      <div role="status" className="mb-9 flex items-center gap-2 text-sm text-neutral-400">
        {status === "loading" || isFinishing ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : status === "ready" ? <Check size={16} className="text-red-500" aria-hidden="true" /> : null}
        {isFinishing ? "Adding your thoughts…" : status === "ready" ? "Your report is ready" : status === "error" ? "Your report couldn’t load" : "Building your report…"}
      </div>

      <p className="eyebrow mb-3">While you wait</p>
      <h1 id="waiting-title" className="font-gothic text-2xl leading-snug sm:text-4xl">How is owned media working for you?</h1>

      <fieldset disabled={isFinishing} className="mt-8">
        <legend className="sr-only">Choose a perspective (optional)</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PERSPECTIVES.map((perspective) => (
            <label key={perspective} className={`flex min-h-16 cursor-pointer items-center justify-between gap-3 border px-4 py-4 text-sm transition-colors ${selectedPerspective === perspective ? "border-red-500 bg-red-600/5 text-white" : "border-neutral-800 text-neutral-300 hover:border-neutral-600"}`}>
              <span>{perspective}</span>
              <input
                type="radio"
                name="perspective"
                value={perspective}
                checked={selectedPerspective === perspective}
                onChange={() => setSelectedPerspective(perspective)}
                className="h-4 w-4 shrink-0 accent-red-600"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor="owned-media-thought" className="mb-3 mt-7 text-sm text-neutral-300">Your thoughts <span className="text-neutral-500">(optional)</span></label>
      <textarea
        id="owned-media-thought"
        rows={4}
        value={customThought}
        onChange={(event) => setCustomThought(event.target.value)}
        disabled={isFinishing}
        placeholder="What’s on your mind?"
        className="audit-input min-h-32 resize-y p-4 text-base leading-relaxed"
      />

      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      <div className="mt-6 flex justify-end">
        {status === "error" ? (
          <button type="button" className="primary-button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>Try again <ArrowRight size={18} aria-hidden="true" /></button>
        ) : (
          <button type="button" onClick={handleFinish} disabled={status !== "ready" || isFinishing} className="primary-button">
            {isFinishing ? "Updating report…" : status === "ready" ? "View report" : "Preparing report…"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
