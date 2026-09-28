"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react"

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const FPS = 24;
const TIMELINE_DURATION_SECONDS = 80;

const formatTimecode = (progress) => {
  const totalFrames = Math.floor(
    progress * TIMELINE_DURATION_SECONDS * FPS,
  );
  const frames = totalFrames % FPS;
  const totalSeconds = Math.floor(totalFrames / FPS);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return [hours, minutes, seconds, frames]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0
        ? window.scrollY / scrollableHeight
        : 0;

      setProgress(clamp(nextProgress, 0, 1));
      frameId = 0;
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const percentage = Math.round(progress * 100);
  const timecode = formatTimecode(progress);

  return (
    <motion.div
      initial={{
        opacity:0,
        y:20,
      }}
      animate={{
        opacity:1,
        y:0,
      }}
      transition={{
        duration:0.8,
        ease: "easeInOut"
      }}
      className="scroll-progress"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={percentage}
    >
      <span className="scroll-progress__label">{timecode}</span>
      <div className="scroll-progress__timeline">
        <div
          className="scroll-progress__fill"
          style={{ transform: `scaleX(${progress})` }}
        />
        <div
          className="scroll-progress__playhead"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      <span className="scroll-progress__fps">30 fps</span>
    </motion.div>
  );
}
