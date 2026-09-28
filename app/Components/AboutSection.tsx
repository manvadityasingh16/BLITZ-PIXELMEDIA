'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import {
  Video,
  Film,
  Loader,
  Camera,
  Compass,
  Monitor,
} from 'lucide-react';

const TEXT_PARAGRAPH =
  'We’re a creative bunch turning ideas into visuals that make people stop and pay attention. From cinematic edits and striking photography to motion, design, and everything in between, we bring a mix of creativity, experimentation, and storytelling to everything we do.';

const TAGS = [
  { name: 'Videography', icon: Video },
  { name: 'Video Editing', icon: Film },
  { name: 'Motion Design', icon: Loader },
  { name: 'Photography', icon: Camera },
  { name: 'Graphic Designing', icon: Monitor },
];

export default function TextFillSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.7'],
  });

  const words = TEXT_PARAGRAPH.split(' ');

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[120vh] w-full flex-col items-center justify-center px-6 py-32 text-center"
    >
        
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10">
        {/* Subtitle Accent */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-2xl italic tracking-wide text-orangish-red md:text-3xl"
        >
         CREATIVITY IN MOTION
        </motion.span>

        {/* Scroll-Revealing Headline */}
        <p className="flex flex-wrap justify-center text-3xl font-bold leading-tight tracking-tight md:text-5xl max-w-4xl">
          {words.map((word, index) => {
            const start = index / words.length;
            const end = start + 1 / words.length;

            return (
              <Word
                key={index}
                word={word}
                progress={scrollYProgress}
                range={[start, end]}
              />
            );
          })}
        </p>

        {/* Tag Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-6 flex max-w-lg flex-wrap justify-center gap-3"
        >
          {TAGS.map((tag) => {
            const Icon = tag.icon;
            return (
              <div
                key={tag.name}
                className="flex items-center gap-2 rounded-full bg-[#525252] px-4 py-2 text-xs font-medium text-white shadow-sm transition-transform hover:scale-105 md:text-sm"
              >
                <Icon size={14} className="opacity-80" />
                <span>{tag.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// Word component handling opacity interpolation per word
function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  // Interpolates word opacity from muted gray to solid dark fill
  const opacity = useTransform(progress, range, [0.25, 1]);

  return (
    <span className="relative inline-block mr-[0.25em] last:mr-0">
      <motion.span style={{ opacity }} className="text-white">
        {word}
      </motion.span>
    </span>
  );
}