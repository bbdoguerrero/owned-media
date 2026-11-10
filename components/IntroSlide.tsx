"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { UserProfile } from "@/app/types/audit";

interface IntroSlideProps {
  initialProfile: UserProfile;
  onNext: (profile: UserProfile) => void;
  onDemo: (profile: UserProfile) => void;
}

const FIELDS = [
  { key: "name", label: "Your name", type: "text", autoComplete: "name" },
  { key: "email", label: "Work email", type: "email", autoComplete: "email" },
  { key: "company", label: "Company", type: "text", autoComplete: "organization" },
  { key: "position", label: "Position", type: "text", autoComplete: "organization-title" },
  { key: "industry", label: "Industry", type: "text", autoComplete: "off" },
] as const;

export function IntroSlide({ initialProfile, onNext, onDemo }: IntroSlideProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof UserProfile, string>> = {};
    for (const { key, label } of FIELDS) {
      if (!profile[key]?.trim()) nextErrors[key] = `Enter ${label.toLowerCase()}.`;
    }
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onNext({ name: profile.name.trim(), email: profile.email.trim(), company: profile.company.trim(), industry: profile.industry.trim(), position: profile.position.trim() });
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-20" aria-labelledby="intro-title">
      <div>
        <h1 id="intro-title" className="font-gothic text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
          Your next opportunity is <span className="text-red-500">already yours.</span>
        </h1>
        <p className="mt-6 max-w-sm text-base leading-relaxed text-neutral-400">Answer three questions. See which brand assets to put to work first.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="border-t border-neutral-700 pt-7">
        <h2 className="mb-7 text-lg font-medium">Let’s start with you.</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map(({ key, label, type, autoComplete }) => (
            <div key={key} className={key === "industry" ? "sm:col-span-2" : undefined}>
              <label htmlFor={`profile-${key}`} className="mb-2 block text-sm text-neutral-400">{label}</label>
              <input
                id={`profile-${key}`}
                name={key}
                type={type}
                autoComplete={autoComplete}
                required
                value={profile[key] ?? ""}
                onChange={(event) => {
                  setProfile((previous) => ({ ...previous, [key]: event.target.value }));
                  if (errors[key]) setErrors((previous) => ({ ...previous, [key]: undefined }));
                }}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `profile-${key}-error` : undefined}
                className="audit-input px-3 py-3 text-base"
              />
              {errors[key] && <p id={`profile-${key}-error`} role="alert" className="mt-2 text-xs text-red-400">{errors[key]}</p>}
            </div>
          ))}
        </div>
        <button type="submit" className="primary-button mt-8 w-full">Start the audit <ArrowRight size={18} aria-hidden="true" /></button>
        <button type="button" onClick={() => onDemo(profile)} className="text-button mt-3 w-full">View demo report <ArrowRight size={16} aria-hidden="true" /></button>
      </form>
    </section>
  );
}
