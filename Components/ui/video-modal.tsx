'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

export interface VideoModalProps {
    /** YouTube video id — the modal is open whenever this is set. */
    youtubeId: string | null;
    title?: string;
    onClose: () => void;
}

/** No-op subscribe — we only need the server/client split of useSyncExternalStore. */
const noopSubscribe = () => () => {};

/** Fullscreen lightbox that plays a YouTube embed on top of the page.
 *  Rendered into document.body so card transforms can't clip or stack over it. */
export function VideoModal({ youtubeId, title, onClose }: VideoModalProps) {
    // false while server-rendering, true once on the client — document.body only
    // exists in the latter.
    const mounted = useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );

    const open = Boolean(youtubeId);

    // Escape to close + lock the page behind the overlay.
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={title ?? 'Video player'}
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md md:p-8"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close video"
                        className="absolute right-4 top-4 grid size-10 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-orangish-red md:right-6 md:top-6"
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-5xl"
                    >
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
                            <iframe
                                key={youtubeId}
                                className="absolute inset-0 h-full w-full"
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                                title={title ?? 'Video'}
                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                allowFullScreen
                            />
                        </div>

                        {title && (
                            <p className="mt-4 text-center font-canela text-xl font-light tracking-tight text-white md:text-2xl">
                                {title}
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default VideoModal;
