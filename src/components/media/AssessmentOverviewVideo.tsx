"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AssessmentOverviewVideoProps {
  src?: string;
  webmSrc?: string;
  poster: string;
  label: string;
  className?: string;
}

export default function AssessmentOverviewVideo({
  src,
  webmSrc,
  poster,
  label,
  className = "",
}: AssessmentOverviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasVideoSource = Boolean(src);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      setPrefersReducedMotion(query.matches);
      if (query.matches) {
        setIsPlaying(false);
      }
    };

    applyPreference();
    query.addEventListener("change", applyPreference);
    return () => query.removeEventListener("change", applyPreference);
  }, []);

  const shouldShowPoster = !hasVideoSource || hasVideoError || prefersReducedMotion;

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play().catch(() => setHasVideoError(true));
    } else {
      video.pause();
    }
  }

  function toggleMuted() {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  return (
    <div
      className={`relative aspect-[16/10] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm ${className}`}
    >
      {shouldShowPoster ? (
        <Image
          src={poster}
          alt={label}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 45vw"
          priority={false}
        />
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster={poster}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          aria-label={label}
          onError={() => setHasVideoError(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
          {src ? <source src={src} type="video/mp4" /> : null}
        </video>
      )}

      <div className="absolute inset-0 bg-[#183531]/10" />

      {!shouldShowPoster ? (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/40 bg-[rgba(255,253,248,0.82)] text-[var(--text-primary)] shadow-sm backdrop-blur hover:bg-white"
            aria-label={isPlaying ? "暂停视频" : "播放视频"}
            title={isPlaying ? "暂停视频" : "播放视频"}
          >
            {isPlaying ? (
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={toggleMuted}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/40 bg-[rgba(255,253,248,0.82)] text-[var(--text-primary)] shadow-sm backdrop-blur hover:bg-white"
            aria-label={isMuted ? "打开视频声音" : "关闭视频声音"}
            title={isMuted ? "打开视频声音" : "关闭视频声音"}
          >
            {isMuted ? (
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9v6h4l5 4V5L8 9H4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m18 9 3 3m0-3-3 3" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9v6h4l5 4V5L8 9H4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7.5 7.5 0 0 1 0 10" />
              </svg>
            )}
          </button>
        </div>
      ) : null}

      <div className="absolute bottom-4 left-4 rounded-lg bg-[rgba(255,253,248,0.88)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] backdrop-blur">
        AI评估流程短片
      </div>
    </div>
  );
}
