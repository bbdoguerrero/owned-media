"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserProfile, UserResponses, AuditInsights } from "@/app/types/audit";
import { IntroSlide } from "@/components/IntroSlide";
import { QuestionSlide } from "@/components/QuestionSlide";
import { ReportLoading } from "@/components/ReportLoading";
import { FinalBentoSlide } from "@/components/FinalBentoSlide";
import { DEMO_INSIGHTS, DEMO_PROFILE } from "@/app/data/demo-audit";

type SlideStep = 0 | 1 | 2 | 3 | 4;

const QUESTIONS = [
  {
    text: "What business or audience challenge needs your attention—and what’s getting in the way?",
    video: "/videos/queston1.mp4",
    field: "q1",
  },
  {
    text: "What do you already own or operate that could work harder?",
    video: "/videos/question2.mp4",
    field: "q2",
  },
  {
    text: "When does your audience meet that asset—and what should it help them do, feel, or understand?",
    video: "/videos/question3.mp4",
    field: "q3",
  },
] as const;

export default function OwnedMediaAuditPage() {
  const [currentStep, setCurrentStep] = useState<SlideStep>(0);
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", company: "", industry: "", position: "" });
  const [responses, setResponses] = useState<UserResponses>({ q1: "", q2: "", q3: "" });
  const [insights, setInsights] = useState<AuditInsights | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [reportError, setReportError] = useState("");
  const reportRequest = useRef<AbortController | null>(null);
  const isGenerating = currentStep === 4 && !insights && !reportError;

  useEffect(() => () => reportRequest.current?.abort(), []);

  const goToStep = (step: SlideStep) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const generateReport = async () => {
    reportRequest.current?.abort();
    const controller = new AbortController();
    reportRequest.current = controller;
    setIsDemo(false);
    setInsights(null);
    setReportError("");
    goToStep(4);

    try {
      const response = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, q1: responses.q1, q2: responses.q2, q3: responses.q3 }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Unable to generate report");
      const result: AuditInsights = await response.json();
      if (!controller.signal.aborted) setInsights(result);
    } catch {
      if (!controller.signal.aborted) setReportError("We couldn’t prepare your report. Please try again.");
    } finally {
      if (reportRequest.current === controller) reportRequest.current = null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <header aria-hidden={isGenerating || undefined} className="site-header border-b border-neutral-900 px-5 sm:px-8">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4">
          <Image
            src="/menu-logo.png"
            alt="BBDO Guerrero"
            width={2560}
            height={359}
            sizes="(max-width: 640px) 160px, 224px"
            loading="eager"
            className="h-auto w-40 shrink-0 sm:w-56"
          />
          {currentStep === 4 && <span className="text-xs text-neutral-500">{isDemo ? "Demo report" : "Your report"}</span>}
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center">
        {currentStep === 0 && (
          <IntroSlide
            initialProfile={profile}
            onNext={(value) => { setIsDemo(false); setProfile(value); goToStep(1); }}
            onDemo={(value) => { setProfile(value); setIsDemo(true); setInsights(DEMO_INSIGHTS); goToStep(4); }}
          />
        )}

        {QUESTIONS.map((question, index) => currentStep === index + 1 && (
          <QuestionSlide
            key={question.field}
            questionNumber={(index + 1) as 1 | 2 | 3}
            questionText={question.text}
            videoSrc={question.video}
            value={responses[question.field]}
            onChange={(value) => setResponses((previous) => ({ ...previous, [question.field]: value }))}
            onNext={() => { if (index === 2) void generateReport(); else goToStep((index + 2) as SlideStep); }}
            onPrev={() => goToStep(index as SlideStep)}
          />
        ))}

        {currentStep === 4 && !insights && (
          <ReportLoading
            profile={profile}
            error={reportError}
            onRetry={() => void generateReport()}
            onBack={() => { reportRequest.current?.abort(); goToStep(3); }}
          />
        )}

        {currentStep === 4 && insights && (
          <FinalBentoSlide insights={insights} profile={isDemo ? DEMO_PROFILE : profile} onRestart={() => { setIsDemo(false); goToStep(0); }} />
        )}
      </div>

      <footer aria-hidden={isGenerating || undefined} className="site-footer border-t border-neutral-900 px-5 py-5 sm:px-8">
        <div className="mx-auto max-w-6xl text-xs text-neutral-500">Make more of what you own.</div>
      </footer>
    </main>
  );
}
