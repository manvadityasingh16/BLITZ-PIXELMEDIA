'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getWork, WORK_CATEGORIES } from '@/lib/team';
import { VideoModal } from '@/Components/ui/video-modal';
import { MasonryGrid } from '@/Components/ui/image-testimonial-grid';

/** One portfolio piece in a landscape frame. Shows a poster + play button; the
 *  click opens the YouTube embed in a lightbox (facade pattern — no iframe cost
 *  until the visitor actually plays it). Caption block below carries the title,
 *  a one-line description and the domain pills. */
function WorkCard({ item, onPlay }) {
  // maxres is a true 16:9 frame; hqdefault is the pillarboxed fallback.
  const [poster, setPoster] = useState(
    `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`,
  );

  return (
    <article className="group flex w-full flex-col">
      {/* Landscape player */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-white/10 bg-neutral-950 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/20">
        <div className="relative aspect-video overflow-hidden bg-black">
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play ${item.title}`}
            className="absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orangish-red"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              loading="lazy"
              onError={() =>
                setPoster(
                  `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`,
                )
              }
              className="absolute inset-0 h-full w-full scale-[1.01] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

            {/* App-logo badge */}
            {item.tool && (
              <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-lg bg-black/50 backdrop-blur-md">
                <Image
                  src={item.tool}
                  alt=""
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </span>
            )}

            {/* Category badge */}
            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-100 backdrop-blur-md">
              {item.category}
            </span>

            {/* Play control */}
            <span className="absolute left-1/2 top-1/2 grid h-12 w-[4.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-[#ff0000] shadow-[0_10px_30px_-8px_rgba(255,0,0,0.75)] transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Caption block */}
      <div className="mt-5 px-1">
        <h3 className="font-canela text-2xl font-light tracking-tight text-white md:text-[1.75rem]">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
            {item.description}
          </p>
        )}

        {item.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors duration-200 group-hover:border-white/20 group-hover:text-neutral-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/** A single still in the photo wall — caption top-left, category pill top-right,
 *  matching the cards on /work. */
function PhotoCard({ photo }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 transition-transform duration-300 ease-in-out hover:scale-[1.03]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.caption}
        loading="lazy"
        className="h-auto w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/10 to-transparent" />
      {photo.category && (
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-100 backdrop-blur-md">
          {photo.category}
        </span>
      )}
      <p className="absolute left-0 top-0 max-w-[70%] p-4 text-sm font-medium leading-tight text-white drop-shadow-md">
        {photo.caption}
      </p>
    </div>
  );
}

/** Responsive masonry wall of stills — used for the photographers instead of
 *  the video grid. */
function PhotoWall({ member }) {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const getColumns = (width) => {
      if (width < 640) return 1;
      if (width < 1024) return 2;
      return 3;
    };

    const handleResize = () => setColumns(getColumns(window.innerWidth));
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <MasonryGrid columns={columns} gap={4}>
      {member.photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </MasonryGrid>
  );
}

export default function MyWork({ member }) {
  const work = useMemo(() => getWork(member), [member]);

  const counts = useMemo(() => {
    const map = new Map([['All', work.length]]);
    for (const w of work) {
      map.set(w.category, (map.get(w.category) ?? 0) + 1);
    }
    return map;
  }, [work]);

  const [active, setActive] = useState('All');

  // Photographers (Herain, Bharat) carry stills rather than YouTube pieces —
  // they get the masonry photo wall instead of the video grid.
  const hasPhotos = member.photos?.length > 0;
  /** Item shown in the lightbox — null when the modal is closed. */
  const [activeItem, setActiveItem] = useState(null);

  const visible =
    active === 'All' ? work : work.filter((w) => w.category === active);

  if (hasPhotos) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PhotoWall member={member} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Category filters — hidden for now
      <div className="no-scrollbar mb-12 -mx-6 flex snap-x items-center gap-2.5 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0">
        {WORK_CATEGORIES.map((cat) => {
          const on = cat === active;
          const count = counts.get(cat) ?? 0;
          return (
            <button
              key={cat}
              type="button"
              disabled={count === 0}
              onClick={() => {
                setActive(cat);
                setActiveItem(null);
              }}
              className={`shrink-0 snap-start cursor-pointer rounded-full border px-5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
                on
                  ? 'border-orangish-red bg-orangish-red/90 text-white shadow-lg shadow-orangish-red/20'
                  : 'border-white/15 bg-transparent text-neutral-300 hover:border-white/40 hover:text-white'
              }`}
            >
              {cat}
              <span
                className={`ml-2 text-xs tabular-nums ${
                  on ? 'text-white/70' : 'text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      */}

      {/* 2-up grid */}
      <div
        key={active}
        className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2"
      >
        {visible.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
          >
            <WorkCard item={item} onPlay={() => setActiveItem(item)} />
          </motion.div>
        ))}
      </div>

      {/* Video lightbox */}
      <VideoModal
        youtubeId={activeItem?.youtubeId ?? null}
        title={activeItem?.title}
        onClose={() => setActiveItem(null)}
      />

      {visible.length === 0 && (
        <p className="py-20 text-center text-sm text-neutral-500">
          Nothing here yet — new work is on the way.
        </p>
      )}
    </div>
  );
}
