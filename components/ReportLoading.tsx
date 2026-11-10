import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { UserProfile } from "@/app/types/audit";

interface ReportLoadingProps {
  profile: UserProfile;
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

export function ReportLoading({ profile, error, onRetry, onBack }: ReportLoadingProps) {
  if (!error) {
    return (
      <section role="status" className="fixed inset-0 z-[100] flex min-h-dvh flex-col items-center justify-center gap-6 bg-black px-5 text-center">
        <Loader2 size={44} strokeWidth={1.5} className="animate-spin text-red-500" aria-hidden="true" />
        <h1 className="font-gothic text-xl text-white sm:text-2xl">Generating your report</h1>
      </section>
    );
  }

  return (
    <section className="audit-report mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14" aria-labelledby="report-title">
      <div className="mb-9 border-b border-neutral-800 pb-7">
        <p className="eyebrow mb-3">{profile.company} / {profile.industry}</p>
        <h1 id="report-title" className="font-gothic text-2xl leading-tight sm:text-4xl">Owned media audit</h1>
      </div>

      <div className="py-10">
          <p role="alert" className="mb-6 text-sm text-red-400">{error}</p>
          <div className="flex flex-wrap items-center gap-6">
            <button type="button" onClick={onRetry} className="primary-button">Try again <ArrowRight size={18} aria-hidden="true" /></button>
            <button type="button" onClick={onBack} className="text-button"><ArrowLeft size={16} aria-hidden="true" /> Back to answers</button>
          </div>
      </div>
    </section>
  );
}
