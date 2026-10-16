"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoBackdrop({ paused, onPlaybackChange }: {
  paused: boolean;
  onPlaybackChange: (paused: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string>();
  const [ready, setReady] = useState(false);
  const preferenceChecked = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const portrait = window.matchMedia("(max-width: 767px) and (orientation: portrait)");
    const connection = "connection" in navigator ? navigator.connection : null;
    const saveData = typeof connection === "object" && connection !== null && "saveData" in connection && connection.saveData === true;
    let disposed = false;
    const sync = () => {
      if (!preferenceChecked.current) {
        preferenceChecked.current = true;
        if (reduce.matches || saveData) { onPlaybackChange(true); return; }
      }
      if (paused || document.hidden) { video.pause(); return; }
      const selected = portrait.matches ? "/film/kershell-ambient-mobile.mp4" : "/film/kershell-ambient.mp4";
      setSource(selected);
      if (video.getAttribute("src") === selected) {
        void video.play().catch(() => { if (!disposed) onPlaybackChange(true); });
      }
    };
    const respectPreference = () => { if (reduce.matches) { video.pause(); onPlaybackChange(true); } };
    sync();
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", respectPreference);
    portrait.addEventListener("change", sync);
    return () => {
      disposed = true;
      video.pause();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", respectPreference);
      portrait.removeEventListener("change", sync);
    };
  }, [paused, onPlaybackChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source || paused) return;
    let disposed = false;
    void video.play().catch(() => { if (!disposed) onPlaybackChange(true); });
    return () => { disposed = true; };
  }, [source, paused, onPlaybackChange]);

  return <div className="experience-video" aria-hidden="true" data-ready={ready}>
    <picture>
      <source media="(max-width: 767px) and (orientation: portrait)" srcSet="/film/kershell-ambient-mobile-poster.webp"/>
      {/* Native picture preserves the selected poster without a video request. */}
      <img src="/film/kershell-ambient-poster.webp" alt="" fetchPriority="high"/>
    </picture>
    <video ref={videoRef} src={source} muted loop playsInline preload="none" disablePictureInPicture tabIndex={-1}
      onLoadStart={() => setReady(false)} onPlaying={() => setReady(true)} onError={() => { setReady(false); onPlaybackChange(true); }}/>
  </div>;
}
