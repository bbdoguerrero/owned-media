"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

interface QuestionSlideProps {
  questionNumber: 1 | 2 | 3;
  questionText: string;
  videoSrc: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function QuestionSlide({
  questionNumber,
  questionText,
  videoSrc,
  value,
  onChange,
  onNext,
  onPrev,
}: QuestionSlideProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Keep sound on. If audible autoplay is blocked, the play button stays available.
    videoRef.current?.play().catch(() => {});
  }, [videoSrc]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleNext = () => {
    if (!value.trim()) {
      setError("Add your answer to continue.");
      textareaRef.current?.focus();
      return;
    }
    onNext();
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-14 pt-6 sm:px-8" aria-labelledby="question-title">
      <div className="mb-5 flex items-center justify-between">
        <button type="button" onClick={onPrev} className="text-button">
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </button>
        <p className="eyebrow">Question {questionNumber} / 3</p>
      </div>

      <div className="w-full bg-neutral-950">
        <div className="relative aspect-video w-full">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted={isMuted}
            playsInline
            preload="auto"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
            onError={() => setVideoError(true)}
            aria-label={`Question ${questionNumber}: ${questionText}`}
            className="h-full w-full object-contain"
          />
          {videoError ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-neutral-400">
              Video unavailable. You can answer the question below.
            </div>
          ) : !isPlaying ? (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play question video"
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/15 text-white transition-colors hover:bg-black/25"
            >
              <Play size={48} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-1">
          <button type="button" onClick={togglePlay} disabled={videoError} className="text-button" aria-label={isPlaying ? "Pause video" : "Play video"}>
            {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={toggleMute} disabled={videoError} className="text-button" aria-label={isMuted ? "Unmute video" : "Mute video"}>
            {isMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>

      <div className="mx-auto mt-9 max-w-3xl sm:mt-12">
        <h1 id="question-title" className="font-gothic text-xl leading-snug text-white sm:text-3xl">
          {questionText}
        </h1>
        <label htmlFor="question-answer" className="sr-only">Your answer</label>
        <textarea
          id="question-answer"
          ref={textareaRef}
          rows={4}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (error) setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              handleNext();
            }
          }}
          placeholder="Your thoughts…"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "answer-error" : undefined}
          className="audit-input mt-6 min-h-36 resize-y p-4 text-base leading-relaxed"
        />
        {error && <p id="answer-error" role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={handleNext} className="primary-button">
            {questionNumber === 3 ? "Build my report" : "Continue"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
