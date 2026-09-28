'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  animate,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import { getTimeline } from '@/lib/team';

/** Per-colour tokens for a clip. */
const PALETTE = {
  brand: {
    bar: '#ed4b25',
    text: '#ffd8ca',
    fill: 'rgba(237,75,37,0.16)',
    edge: 'rgba(237,75,37,0.42)',
    glow: 'rgba(237,75,37,0.38)',
  },
  amber: {
    bar: '#f59e0b',
    text: '#fde4b3',
    fill: 'rgba(245,158,11,0.13)',
    edge: 'rgba(245,158,11,0.4)',
    glow: 'rgba(245,158,11,0.32)',
  },
  violet: {
    bar: '#c084fc',
    text: '#ecd8ff',
    fill: 'rgba(192,132,252,0.15)',
    edge: 'rgba(192,132,252,0.42)',
    glow: 'rgba(192,132,252,0.32)',
  },
  blue: {
    bar: '#38bdf8',
    text: '#c2ebff',
    fill: 'rgba(56,189,248,0.13)',
    edge: 'rgba(56,189,248,0.4)',
    glow: 'rgba(56,189,248,0.3)',
  },
};

/** Lane row height + vertical gap → the drag snap stride. Must track the
 *  `h-[76px]` lanes and `gap-2` (8px) below. */
const ROW = 76;
const GAP = 8;
const STRIDE = ROW + GAP;

/** Shortest a clip may be trimmed to, in ruler units. */
const MIN_SPAN = 3;

/** Deterministic 0..1 hash so the waveform matches on server and client. */
function amp(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const pct = (value, duration) => `${(value / duration) * 100}%`;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Deep-clone the lane model so edits never mutate the pristine base. */
function cloneLanes(src) {
  return src.map((lane) => lane.map((seg) => ({ ...seg, tags: [...seg.tags] })));
}

/* --------------------------------------------------------------- Tool palette */

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const TOOLS = [
  {
    id: 'select',
    key: 'v',
    label: 'Selection · V — click to select, edit titles, drag edges to trim',
    cursor: 'cursor-default',
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]">
        <path
          d="M5 3l14 8-5.8 1.4L15.6 19l-2.3 1-2.4-6.6L6 17.5z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'hand',
    key: 'h',
    label: 'Hand · H — drag clips between tracks, scrub the playhead',
    cursor: 'cursor-grab',
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" {...strokeProps}>
        <path d="M18 11V6a2 2 0 0 0-4 0" />
        <path d="M14 10V4a2 2 0 0 0-4 0v2" />
        <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    ),
  },
  {
    id: 'razor',
    key: 'c',
    label: 'Razor · C — click a clip to cut it',
    cursor: 'cursor-crosshair',
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" {...strokeProps}>
        <circle cx="6" cy="6" r="2.6" />
        <circle cx="6" cy="18" r="2.6" />
        <line x1="20" y1="4" x2="8.1" y2="15.9" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" />
        <line x1="8.1" y1="8.1" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'type',
    key: 't',
    label: 'Type · T — click a clip or the heading to edit its text',
    cursor: 'cursor-text',
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" {...strokeProps}>
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
];

const TOOL_CURSOR = Object.fromEntries(TOOLS.map((t) => [t.id, t.cursor]));

function Toolbar({ active, onSelect }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-black/40 p-2">
      {TOOLS.map((tool) => {
        const isActive = tool.id === active;
        return (
          <motion.button
            key={tool.id}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            aria-pressed={isActive}
            onClick={() => onSelect(tool.id)}
            whileTap={{ scale: 0.9 }}
            className={`grid size-9 place-items-center rounded-lg transition-colors ${
              isActive
                ? 'bg-orangish-red text-black shadow-[0_2px_10px_rgba(237,75,37,0.5)]'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-100'
            }`}
          >
            {tool.icon}
          </motion.button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------- Waveform */

/** Bars per timeline unit — sets waveform density. */
const BARS_PER_UNIT = 3.4;

/** Bars are counted from the segment's span and indexed by absolute time
 *  position, so a razor cut just reveals the continuing waveform on each
 *  piece instead of squashing a fixed bar count into a narrow clip. */
function Waveform({ color, start, span }) {
  const bars = useMemo(() => {
    const count = Math.max(8, Math.round(span * BARS_PER_UNIT));
    const offset = Math.round(start * BARS_PER_UNIT);
    return Array.from({ length: count }, (_, k) => {
      const i = offset + k;
      return {
        height: 0.28 + amp(i) * 0.72,
        delay: (amp(i + 7) * -1.6).toFixed(2),
        duration: (0.7 + amp(i + 3) * 0.9).toFixed(2),
      };
    });
  }, [start, span]);

  return (
    <div className="flex h-full w-full items-center gap-px px-2">
      {bars.map((bar, i) => (
        <span
          key={i}
          className="eq-bar flex-1 rounded-full will-change-transform"
          style={{
            height: `${bar.height * 100}%`,
            background: color,
            transformOrigin: 'center',
            animation: `eq-bounce ${bar.duration}s ease-in-out ${bar.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- Resize grip */

/** Edge handle shown on a selected clip. Dragging it feeds the pointer delta
 *  back to the parent, converted from px to ruler units via the live stage
 *  width. Left grip moves `start` (and compensates `span`); right grip only
 *  changes `span`. */
function ResizeHandle({ side, color, onResize }) {
  const begin = (event) => {
    event.stopPropagation();
    event.preventDefault();
    onResize(side, event);
  };
  return (
    <div
      onPointerDown={begin}
      className={`absolute inset-y-0 z-20 flex w-2.5 cursor-ew-resize items-center justify-center ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <span
        className="h-6 w-[3px] rounded-full opacity-80"
        style={{ background: color }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------- Clip */

/** A single clip segment. Behaviour depends on the active tool:
 *  select → click to select, click the title to rename, drag edge grips to
 *  trim; hand → Framer-Motion vertical drag that swaps whole tracks on drop;
 *  razor → click to cut. */
function Clip({
  seg,
  laneIndex,
  laneCount,
  duration,
  tool,
  selected,
  stageRef,
  onSelect,
  onSwap,
  onCut,
  onEditTitle,
  onResize,
}) {
  const c = PALETTE[seg.color];
  const cardRef = useRef(null);
  const inputRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);

  // Editing only counts while the Type tool is active, so switching tools
  // drops the input without a state-syncing effect.
  const isEditing = editing && tool === 'type';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const fracFromEvent = (event) => {
    const box = cardRef.current.getBoundingClientRect();
    return clamp((event.clientX - box.left) / box.width, 0, 1);
  };

  const onCardDown = (event) => {
    // The audio track is locked (read-only). Swallow the press so neither the
    // clip nor the stage acts on it — no select, cut, trim or drag.
    if (seg.audio) {
      event.stopPropagation();
      return;
    }
    if (tool === 'razor') {
      event.stopPropagation();
      onCut(laneIndex, seg.id, clamp(fracFromEvent(event), 0.18, 0.82));
      return;
    }
    if (tool === 'type') {
      if (seg.audio) return; // the audio track has no title to edit
      event.stopPropagation();
      setEditing(true);
      return;
    }
    if (tool === 'select') {
      event.stopPropagation();
      onSelect(seg.id);
      return;
    }
    // hand: let Framer's drag take over, but keep the stage from scrubbing.
    if (tool === 'hand') event.stopPropagation();
  };

  const onTitleDown = (event) => {
    if (tool !== 'type' || seg.audio) return;
    event.stopPropagation();
    setEditing(true);
  };

  // Convert a pointer drag on an edge grip into start/span updates.
  const beginResize = (side, downEvent) => {
    const stageWidth = stageRef.current?.getBoundingClientRect().width;
    if (!stageWidth) return;
    const unitPerPx = duration / stageWidth;
    const startX = downEvent.clientX;
    const origin = { start: seg.start, span: seg.span };

    const move = (event) => {
      const d = (event.clientX - startX) * unitPerPx;
      if (side === 'right') {
        const span = clamp(origin.span + d, MIN_SPAN, duration - origin.start);
        onResize(laneIndex, seg.id, { start: origin.start, span });
      } else {
        const start = clamp(origin.start + d, 0, origin.start + origin.span - MIN_SPAN);
        onResize(laneIndex, seg.id, { start, span: origin.span + (origin.start - start) });
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const boxShadow = [
    `inset 3px 0 0 0 ${c.bar}`,
    selected ? `0 0 0 1.6px ${c.bar}` : '',
    hovered || selected ? `0 0 26px -6px ${c.glow}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const locked = seg.audio;
  const cursor = locked
    ? 'cursor-not-allowed'
    : tool === 'hand'
      ? 'cursor-grab'
      : TOOL_CURSOR[tool] ?? 'cursor-default';
  const canDrag = tool === 'hand' && !locked;

  return (
    <div
      className="absolute inset-y-1"
      style={{ left: pct(seg.start, duration), width: pct(seg.span, duration) }}
    >
      <motion.div
        ref={cardRef}
        data-clip
        drag={canDrag ? 'y' : false}
        dragConstraints={{
          top: -laneIndex * STRIDE,
          bottom: (laneCount - 1 - laneIndex) * STRIDE,
        }}
        dragElastic={0.14}
        dragMomentum={false}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          const target = clamp(
            laneIndex + Math.round(info.offset.y / STRIDE),
            0,
            laneCount - 1,
          );
          if (target !== laneIndex) onSwap(laneIndex, target);
        }}
        whileDrag={{ scale: 1.03, zIndex: 40, cursor: 'grabbing' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 + laneIndex * 0.06, ease: [0.22, 1, 0.36, 1] }}
        onPointerDown={onCardDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`group relative h-full w-full select-none overflow-hidden rounded-md border will-change-transform ${cursor}`}
        style={{ background: c.fill, borderColor: c.edge, boxShadow }}
      >
        {seg.audio ? (
          <div className="flex h-full items-center">
            <div className="h-full flex-1">
              <Waveform color={c.bar} start={seg.start} span={seg.span} />
            </div>
            {/* Tags only on a wide (uncut) segment, so cut pieces keep the
                waveform full-width and legible. */}
            {seg.span >= 14 && (
              <div className="hidden shrink-0 items-center gap-2 pr-4 sm:flex">
                {seg.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] tracking-wide"
                    style={{ color: c.text }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center px-3.5">
            {isEditing ? (
              <input
                ref={inputRef}
                value={seg.title}
                onChange={(e) => onEditTitle(laneIndex, seg.id, e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                className="w-full bg-transparent px-0 font-canela text-[17px] font-medium leading-tight outline-none"
                style={{ color: c.text }}
              />
            ) : (
              <p
                onPointerDown={onTitleDown}
                className={`truncate font-canela text-[17px] font-medium leading-tight ${
                  tool === 'type' ? 'cursor-text' : ''
                }`}
                style={{ color: c.text }}
              >
                {seg.title}
              </p>
            )}
            <p className="mt-0.5 truncate text-[12px] text-neutral-300/90">
              {seg.subtitle}
            </p>
            <p className="mt-1 truncate font-mono text-[10px] tracking-wide text-neutral-400/80">
              {seg.tags.join('  ·  ')}
            </p>
          </div>
        )}

        {/* Trim grips — only while this clip is selected in Select mode.
            Never on the locked audio track. */}
        {tool === 'select' && selected && !locked && (
          <>
            <ResizeHandle side="left" color={c.bar} onResize={beginResize} />
            <ResizeHandle side="right" color={c.bar} onResize={beginResize} />
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------ Editable heading */

function TimelineHeading({ member, tool }) {
  const first = member.name.split(' ')[0];
  const [text, setText] = useState(`${first}’s career, on the reel`);
  const [editing, setEditing] = useState(false);
  const editable = tool === 'type';
  const isEditing = editing && editable;

  return (
    <div className="mx-auto mb-10 max-w-5xl text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-orangish-red">
        The Cut
      </p>
      {isEditing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
          className="mt-3 w-full bg-transparent px-2 py-1 text-center font-canela text-2xl font-light italic tracking-tight text-white outline-none md:text-3xl"
        />
      ) : (
        <h3
          onClick={() => editable && setEditing(true)}
          title={editable ? 'Click to edit' : undefined}
          className={`mt-3 font-canela text-2xl font-light italic tracking-tight text-white md:text-3xl ${
            editable
              ? ''
              : ''
          }`}
        >
          {text}
        </h3>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- Timeline */

export default function CareerTimeline({ member }) {
  const timeline = useMemo(() => getTimeline(member), [member]);
  const { duration, clips, audio } = timeline;

  const stageRef = useRef(null);
  const scrubbing = useRef(false);
  const rectRef = useRef(null);
  const idleTimer = useRef(null);
  const cutSeq = useRef(0);
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const transportRunRef = useRef(0);
  const toggleRef = useRef(() => {});

  const [grabbing, setGrabbing] = useState(false);
  const [tool, setTool] = useState('select');
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  // Bumped by Restart to remount the heading, so an edited title reverts too.
  const [resetKey, setResetKey] = useState(0);

  // Where the playhead settles — flush with the first clip's leading edge, so
  // it lines up with the ruler's 00:00 tick.
  const rest = useMemo(
    () => (clips[0].start / duration) * 100,
    [clips, duration], 
  );

  // Where the intro sweep starts: the first clip's out point. The playhead
  // rewinds home from there, since resting at zero leaves nowhere to travel.
  const introFrom = useMemo(
    () => clamp(((clips[0].start + clips[0].span) / duration) * 100, 0, 100),
    [clips, duration],
  );

  // Playhead position as a motion value (percent) — Framer drives every sweep,
  // scrub and drift-home, so there's no hand-rolled rAF loop.
  const head = useMotionValue(introFrom);
  const headLeft = useMotionTemplate`${head}%`;

  // Fixed track labels (V3/V2/V1/A1) — clips move between them, labels don't.
  const tracks = useMemo(
    () => [
      ...clips.map((cl) => ({ track: cl.track, period: cl.period })),
      { track: audio.track, period: audio.period, locked: true },
    ],
    [clips, audio],
  );

  // Pristine lane model — one segment per lane to start.
  const base = useMemo(() => {
    const clipLanes = clips.map((cl, i) => [{ id: `v${i}`, ...cl }]);
    const audioLane = [{ id: 'a0', ...audio, color: 'blue', audio: true }];
    return [...clipLanes, audioLane];
  }, [clips, audio]);

  // Each member is its own route, so this fresh-mount init is enough.
  const [lanes, setLanes] = useState(() => cloneLanes(base));

  const ticks = useMemo(() => {
    const out = [];
    for (let t = 0; t < duration; t += 4) out.push(t);
    return out;
  }, [duration]);

  // ---- Tool selection. Leaving Select clears the current clip selection.
  const chooseTool = useCallback((id) => {
    setTool(id);
    if (id !== 'select') setSelected(null);
  }, []);

  // ---- Edits (all persistent — this is a real little editor now).
  const swapLanes = (a, b) =>
    setLanes((prev) => {
      // The audio lane is locked in place (always the last lane), so refuse any
      // swap that would move it or drop another clip onto it.
      const audioLane = prev.length - 1;
      if (a === audioLane || b === audioLane) return prev;
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });

  const cutClip = (laneIndex, id, frac) =>
    setLanes((prev) =>
      prev.map((lane, i) => {
        if (i !== laneIndex) return lane;
        const out = [];
        lane.forEach((seg) => {
          if (seg.id !== id) {
            out.push(seg);
            return;
          }
          const head = seg.span * frac;
          out.push({ ...seg, span: head });
          out.push({
            ...seg,
            id: `${seg.id}-c${(cutSeq.current += 1)}`,
            start: seg.start + head,
            span: seg.span - head,
          });
        });
        return out;
      }),
    );

  const editTitle = (laneIndex, id, value) =>
    setLanes((prev) =>
      prev.map((lane, i) =>
        i !== laneIndex
          ? lane
          : lane.map((seg) => (seg.id === id ? { ...seg, title: value } : seg)),
      ),
    );

  const resizeClip = (laneIndex, id, patch) =>
    setLanes((prev) =>
      prev.map((lane, i) =>
        i !== laneIndex
          ? lane
          : lane.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg)),
      ),
    );

  // ---- Scrub the playhead with the Hand tool; drift home 3s after release.
  const pointToPct = (clientX) => {
    const r = rectRef.current;
    return clamp(((clientX - r.left) / r.width) * 100, 0, 100);
  };

  const stageDown = (event) => {
    if (event.target.closest('[data-clip]')) return; // clip owns its own press
    if (tool === 'select') {
      setSelected(null);
      return;
    }
    if (tool !== 'hand') return; // razor does nothing on empty track
    if (playing) {
      setPlaying(false);
      fadeSound(0);
    }
    scrubbing.current = true;
    setGrabbing(true);
    head.stop();
    if (idleTimer.current) clearTimeout(idleTimer.current);
    rectRef.current = stageRef.current.getBoundingClientRect();
    stageRef.current.setPointerCapture(event.pointerId);
    head.set(pointToPct(event.clientX));
  };

  const stageMove = (event) => {
    if (!scrubbing.current) return;
    head.set(pointToPct(event.clientX));
  };

  const stageUp = () => {
    if (!scrubbing.current) return;
    scrubbing.current = false;
    setGrabbing(false);
    rectRef.current = null;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      animate(head, rest, { duration: 0.75, ease: [0.22, 1, 0.36, 1] });
    }, 3000);
  };

  // ---- Sound. Personal timeline song from /public, faded on play/pause.
  const clearFade = () => {
    if (fadeRef.current) {
      cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    }
  };

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    if (!audio.source) return null;
    const el = new Audio(audio.source);
    el.preload = 'auto';
    el.loop = false;
    el.volume = 0;
    audioRef.current = el;
    return el;
  };

  const resolveSongDuration = async (el) => {
    if (!el) return 9;
    if (Number.isFinite(el.duration) && el.duration > 0) return el.duration;
    await new Promise((resolve) => {
      const done = () => resolve();
      el.addEventListener('loadedmetadata', done, { once: true });
      el.addEventListener('error', done, { once: true });
    });
    return Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 9;
  };

  const fadeSound = (to, options = {}) => {
    const { rewind = false } = options;
    const el = to > 0 ? ensureAudio() : audioRef.current;
    if (!el) return;
    if (rewind) el.currentTime = 0;

    if (to > 0 && el.paused) {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          console.error('Timeline song playback failed:', err);
        });
      }
    }

    clearFade();
    const from = el.volume;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / 180, 1);
      el.volume = from + (to - from) * progress;
      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(step);
        return;
      }
      fadeRef.current = null;
      if (to === 0) el.pause();
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  // ---- Transport. Play sweeps the playhead to the end at a steady rate and
  // starts the pad; pause freezes it and fades the pad out.
  const PLAY_SECONDS = 9;

  const play = async ({ rewind = false } = {}) => {
    const runId = (transportRunRef.current += 1);
    head.stop();
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (rewind || head.get() >= 99.9) head.set(0);

    const el = ensureAudio();
    let songSeconds = PLAY_SECONDS;
    if (el) {
      songSeconds = await resolveSongDuration(el);
      if (runId !== transportRunRef.current) return;
      const progress = clamp(head.get() / 100, 0, 1);
      const seekTo = Math.min(
        progress * songSeconds,
        Math.max(songSeconds - 0.05, 0),
      );
      el.currentTime = seekTo;
    }

    const remaining = (100 - head.get()) / 100;
    setPlaying(true);
    fadeSound(0.12);
    animate(head, 100, {
      duration: songSeconds * remaining,
      ease: 'linear',
      onComplete: () => {
        if (runId !== transportRunRef.current) return;
        setPlaying(false);
        fadeSound(0);
      },
    });
  };

  const pause = () => {
    transportRunRef.current += 1;
    head.stop();
    setPlaying(false);
    fadeSound(0);
  };

  const togglePlay = () => (playing ? pause() : play());

  // ---- Restart. Rewind the playhead to the top, discard every edit (cuts,
  // trims, renames, track swaps, the heading) back to the pristine sequence,
  // then play from the start with the pad rolling.
  const restart = () => {
    head.stop();
    if (idleTimer.current) clearTimeout(idleTimer.current);
    transportRunRef.current += 1;
    setLanes(cloneLanes(base));
    setSelected(null);
    setResetKey((k) => k + 1);
    head.set(0);
    play({ rewind: true });
  };

  // Keep the Spacebar handler pointing at the current transport state without
  // re-subscribing the global key listener on every play/pause.
  useEffect(() => {
    toggleRef.current = togglePlay;
  });

  // ---- Intro sweep once the panel scrolls into view.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      head.set(rest);
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(head, rest, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(stage);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest]);

  // ---- Keyboard tool shortcuts (V / H / C), ignored while typing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === ' ') {
        e.preventDefault();
        toggleRef.current();
        return;
      }
      const match = TOOLS.find((t) => t.key === e.key.toLowerCase());
      if (match) chooseTool(match.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chooseTool]);

  // ---- Clear the idle timer and tear down timeline audio on unmount.
  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      clearFade();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    },
    [],
  );

  const stageCursor = grabbing
    ? 'cursor-grabbing'
    : TOOL_CURSOR[tool] ?? 'cursor-default';

  return (
    <div className="mx-auto w-full max-w-5xl">
      <TimelineHeading key={resetKey} member={member} tool={tool} />

      <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm">
        {/* Tool palette — inside the panel, Premiere-style */}
        <Toolbar active={tool} onSelect={chooseTool} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 sm:inline">
              {member.name.split(' ')[0]} · Sequence 01
            </span>

            {/* Transport — restart rewinds & clears every edit, play/pause
                sweeps the playhead and the ambient pad */}
            <motion.button
              type="button"
              onClick={restart}
              whileTap={{ scale: 0.9, rotate: -45 }}
              aria-label="Restart from start and reset all edits"
              title="Restart · rewind and reset all cuts"
              className="ml-auto grid size-6 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-neutral-300 transition hover:bg-white/[0.12] hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" {...strokeProps}>
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <polyline points="3 3 3 6 6 6" />
              </svg>
            </motion.button>

            <motion.button
              type="button"
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              aria-label={playing ? 'Pause' : 'Play'}
              aria-pressed={playing}
              title={playing ? 'Pause · Space' : 'Play · Space'}
              className="grid size-6 place-items-center rounded-full bg-orangish-red text-black shadow-[0_2px_8px_rgba(237,75,37,0.5)] transition hover:brightness-110"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </motion.button>

            <span className="ml-3 font-mono text-[10px] tracking-widest text-neutral-600">
              24fps · 00:{String(duration).padStart(2, '0')}
            </span>
          </div>

          {/* Scrolls horizontally; scrollbar hidden on every device */}
          <div className="no-scrollbar overflow-x-auto p-3 sm:p-4">
            <div style={{ minWidth: '640px' }}>
              <div className="grid grid-cols-[76px_1fr] gap-x-3">
                {/* Track badges */}
                <div className="flex flex-col gap-2">
                  <div className="h-7" />
                  {tracks.map((t) => (
                    <div
                      key={t.track}
                      className="flex h-[76px] flex-col justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300">
                          {t.track}
                        </span>
                        {/* Track controls — decorative UI only, not interactive.
                            Video tracks show visible + unlocked; audio is locked. */}
                        <span
                          className="flex items-center gap-1 text-neutral-500"
                          aria-hidden="true"
                        >
                          {t.locked ? (
                            <svg viewBox="0 0 24 24" className="size-3" {...strokeProps}>
                              <rect x="5" y="11" width="14" height="9" rx="2" />
                              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                            </svg>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" className="size-3" {...strokeProps}>
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <svg viewBox="0 0 24 24" className="size-3" {...strokeProps}>
                                <rect x="5" y="11" width="14" height="9" rx="2" />
                                <path d="M8 11V7a4 4 0 0 1 7.9-1" />
                              </svg>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-500">
                        {t.locked ? 'Locked' : t.period}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ruler + lanes + playhead */}
                <div
                  ref={stageRef}
                  onPointerDown={stageDown}
                  onPointerMove={stageMove}
                  onPointerUp={stageUp}
                  onLostPointerCapture={stageUp}
                  className={`relative touch-none select-none ${stageCursor}`}
                >
                  {/* Ruler */}
                  <div className="relative h-7 border-b border-white/[0.06]">
                    {ticks.map((t) => (
                      <div
                        key={t}
                        className="absolute bottom-0 top-0 flex flex-col justify-between"
                        style={{ left: pct(t, duration) }}
                      >
                        <span className="ml-1 font-mono text-[9px] tracking-wider text-neutral-600">
                          00:{String(t).padStart(2, '0')}
                        </span>
                        <span className="h-1.5 w-px bg-white/15" />
                      </div>
                    ))}
                  </div>

                  {/* Lanes */}
                  <div className="flex flex-col gap-2 pt-2">
                    {lanes.map((laneSegs, li) => (
                      <div
                        key={tracks[li].track}
                        className="relative h-[76px] rounded-lg bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_calc(100%/6))]"
                      >
                        {laneSegs.map((seg) => (
                          <Clip
                            key={seg.id}
                            seg={seg}
                            laneIndex={li}
                            laneCount={lanes.length}
                            duration={duration}
                            tool={tool}
                            selected={selected === seg.id}
                            stageRef={stageRef}
                            onSelect={setSelected}
                            onSwap={swapLanes}
                            onCut={cutClip}
                            onEditTitle={editTitle}
                            onResize={resizeClip}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Playhead */}
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 z-20 -translate-x-1/2"
                    style={{ left: headLeft }}
                  >
                    <div className="mx-auto h-full w-px bg-orangish-red/80 shadow-[0_0_10px_rgba(237,75,37,0.7)]" />
                    <motion.div
                      animate={{ scale: grabbing ? 1.25 : 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute -top-1 left-1/2 flex h-5 w-4 -translate-x-1/2 flex-col items-center justify-center gap-[2px] rounded-[3px] border border-orangish-red/60 bg-orangish-red/90 shadow-[0_2px_8px_rgba(237,75,37,0.6)]"
                    >
                      <span className="h-[2px] w-2 rounded-full bg-black/50" />
                      <span className="h-[2px] w-2 rounded-full bg-black/50" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
