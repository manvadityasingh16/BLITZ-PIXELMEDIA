// 'use client';

// import React, { useEffect, useState } from 'react';
// import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
// import { ArrowUpRight, Minus, Plus } from 'lucide-react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { TEAM, type TeamMember } from '@/lib/team';

// export default function KineticTeamHybrid() {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [isMobile, setIsMobile] = useState(false);

//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);

//   const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
//   const cursorX = useSpring(mouseX, springConfig);
//   const cursorY = useSpring(mouseY, springConfig);

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);

//     checkMobile();
//     window.addEventListener('resize', checkMobile);

//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
//     if (isMobile) return;

//     mouseX.set(event.clientX + 20);
//     mouseY.set(event.clientY + 20);
//   };

//   return (
//     <div
//       onMouseMove={handleMouseMove}
//       className="relative min-h-screen w-full cursor-default px-6 py-24 text-neutral-200 md:px-12"
//     >
//       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
//       <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

//       <div className="mx-auto max-w-6xl">
//         <motion.header
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="mb-20 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
//         >

//         </motion.header>

//         <div className="flex flex-col">
//           {TEAM.map((member, index) => (
//             <Link key={member.id} href={`/team/${member.username}`} className="group curspor-pointer">
//               <TeamRow
//                 key={member.id}
//                 data={member}
//                 index={index}
//                 isActive={activeId === member.id}
//                 setActiveId={setActiveId}
//                 isMobile={isMobile}
//                 isAnyActive={activeId !== null}
//               />
//             </Link>
//           ))}
//         </div>
//       </div>

//       {!isMobile && (
//         <motion.div
//           style={{ x: cursorX, y: cursorY }}
//           className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
//         >
//           <AnimatePresence mode="wait">
//             {activeId && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
//                 animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
//                 exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
//                 transition={{ type: 'spring', stiffness: 300, damping: 25 }}
//                 className="relative h-64 w-80 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl"
//               >
//                 <Image
//                   src={TEAM.find((teamMember) => teamMember.id === activeId)?.image ?? TEAM[0].image}
//                   alt="Preview"
//                   fill
//                   className="h-full w-full object-cover"
//                 />

//                 <div className="absolute bottom-0 w-full bg-linear-to-t from-black/80 to-transparent p-4">
//                   <div className="flex items-center gap-2">
//                     <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
//                     <span className="text-[10px] uppercase tracking-widest text-white/80">
//                       Active
//                     </span>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>
//       )}
//     </div>
//   );
// }

// function TeamRow({
//   data,
//   index,
//   isActive,
//   setActiveId,
//   isMobile,
//   isAnyActive,
// }: {
//   data: TeamMember;
//   index: number;
//   isActive: boolean;
//   setActiveId: (id: string | null) => void;
//   isMobile: boolean;
//   isAnyActive: boolean;
// }) {
//   const isDimmed = isAnyActive && !isActive;

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 20 }}
//       animate={{
//         opacity: isDimmed ? 0.3 : 1,
//         y: 0,
//         backgroundColor: isActive && isMobile ? 'rgba(255,255,255,0.03)' : 'transparent',
//       }}
//       transition={{ duration: 0.4, delay: index * 0.05 }}
//       onMouseEnter={() => !isMobile && setActiveId(data.id)}
//       onMouseLeave={() => !isMobile && setActiveId(null)}
//       onClick={() => isMobile && setActiveId(isActive ? null : data.id)}
//       className={`group relative border-t border-neutral-900 transition-colors duration-500 last:border-b ${isMobile ? 'cursor-pointer' : 'cursor-default'
//         }`}
//     >
//       <div className="relative z-10 flex flex-col py-8 md:flex-row md:items-center md:justify-between md:py-12">
//         <div className="flex items-start gap-6 pl-4 transition-transform duration-500 group-hover:translate-x-4 md:gap-12 md:pl-0">
//           <span className="font-mono text-xs text-neutral-600">0{index + 1}</span>
//           <div>
//             <h2 className="text-3xl font-medium font-canela tracking-tight text-neutral-400 transition-colors duration-300 group-hover:text-white md:text-6xl">
//               {data.name}
//             </h2>

//             <motion.div
//               initial={false}
//               animate={{
//                 height: isActive ? 'auto' : 0,
//                 marginTop: isActive ? 16 : 0,
//                 opacity: isActive ? 1 : 0,
//                 y: isActive ? 0 : -8,
//               }}
//               transition={{ duration: 0.3, ease: 'easeOut' }}
//               className="flex overflow-hidden"
//               aria-label={`${data.name}'s software skills`}
//             >
//               <div className="flex items-center gap-2">
//                 {data.skills.map((skill, skillIndex) => (
//                   <motion.div
//                     key={skill.name}
//                     initial={false}
//                     animate={{ scale: isActive ? 1 : 0.75 }}
//                     transition={{
//                       duration: 0.25,
//                       delay: isActive ? skillIndex * 0.05 : 0,
//                     }}
//                     title={skill.name}
//                     className="relative flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2 backdrop-blur-sm md:size-11"
//                   >
//                     <Image
//                       src={skill.icon}
//                       alt={`${skill.name} logo`}
//                       width={32}
//                       height={32}
//                       className="size-full object-contain"
//                     />
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         <div className="mt-4 flex items-center justify-between pl-12 pr-4 md:mt-0 md:justify-end md:gap-12 md:pl-0 md:pr-0">
//           <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 transition-colors group-hover:text-neutral-400">
//             {data.role}
//           </span>

//           <div className="block text-neutral-500 font-canela md:hidden">
//             {isActive ? <Minus size={18} /> : <Plus size={18} />}
//           </div>

//           <motion.div
//             animate={{ x: isActive ? 0 : -10, opacity: isActive ? 1 : 0 }}
//             className="hidden text-white md:block"
//           >
//             <ArrowUpRight size={28} strokeWidth={1.5} />
//           </motion.div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {isMobile && isActive && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.3, ease: 'easeInOut' }}
//             className="overflow-hidden bg-neutral-900/50"
//           >
//             <div className="p-4">
//               <div className="relative aspect-video w-full overflow-hidden rounded-lg">
//                 <Image src={data.image} alt={data.name} className="h-full w-full object-cover" fill sizes="100vw" />
//                 <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
//                 <div className="absolute bottom-4 left-4">
//                   <p className="text-xs uppercase tracking-widest text-white">View Profile</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TEAM, type TeamMember } from '@/lib/team';

export default function KineticTeamHybrid() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;

    mouseX.set(event.clientX + 20);
    mouseY.set(event.clientY + 20);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full cursor-default px-6 py-24 text-neutral-200 md:px-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        />

        <div className="flex flex-col">
          {TEAM.map((member, index) => (
            <TeamRow
              key={member.id}
              data={member}
              index={index}
              isActive={activeId === member.id}
              setActiveId={setActiveId}
              isMobile={isMobile}
              isAnyActive={activeId !== null}
            />
          ))}
        </div>
      </div>

      {!isMobile && (
        <motion.div
          style={{ x: cursorX, y: cursorY }}
          className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
        >
          <AnimatePresence mode="wait">
            {activeId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative h-64 w-80 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl"
              >
                <Image
                  src={TEAM.find((teamMember) => teamMember.id === activeId)?.image ?? TEAM[0].image}
                  alt="Preview"
                  fill
                  sizes="320px"
                  className="h-full w-full object-cover"
                />

                <div className="absolute bottom-0 w-full bg-linear-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span className="text-[10px] uppercase tracking-widest text-white/80">
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function TeamRow({
  data,
  index,
  isActive,
  setActiveId,
  isMobile,
  isAnyActive,
}: {
  data: TeamMember;
  index: number;
  isActive: boolean;
  setActiveId: (id: string | null) => void;
  isMobile: boolean;
  isAnyActive: boolean;
}) {
  const isDimmed = isAnyActive && !isActive;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDimmed ? 0.3 : 1,
        y: 0,
        backgroundColor: isActive && isMobile ? 'rgba(255,255,255,0.03)' : 'transparent',
      }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => !isMobile && setActiveId(data.id)}
      onMouseLeave={() => !isMobile && setActiveId(null)}
      onClick={() => isMobile && setActiveId(isActive ? null : data.id)}
      className="group relative border-t border-neutral-900 transition-colors duration-500 last:border-b md:cursor-pointer"
    >

      <div className="relative z-10 flex flex-col py-8 md:flex-row md:items-center md:justify-between md:py-12">
        {/* Desktop Wrapper for Navigation */}
        {!isMobile ? (
          <Link
            href={`/team/${data.username}`}
            className="flex w-full flex-col md:flex-row md:items-center md:justify-between"
          >
            <RowContent data={data} index={index} isActive={isActive} />
          </Link>
        ) : (
          <RowContent data={data} index={index} isActive={isActive} />
        )}
      </div>

      <AnimatePresence>
        {isMobile && isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-neutral-900/50"
          >
            <div className="p-4">
              <Link
                href={`/team/${data.username}`}
                onClick={(e) => e.stopPropagation()}
                className="relative block aspect-video w-full overflow-hidden rounded-lg"
              >
                <Image src={data.image} alt={data.name} className="h-full w-full object-cover" fill sizes="100vw" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white">
                  <span>View Profile</span>
                  <ArrowUpRight size={14} />
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RowContent({
  data,
  index,
  isActive,
}: {
  data: TeamMember;
  index: number;
  isActive: boolean;
}) {
  return (
    <>
      <div className="flex items-start gap-6 pl-4 transition-transform duration-500 group-hover:translate-x-4 md:gap-12 md:pl-0">
        <span className="font-mono text-xs text-neutral-600">0{index + 1}</span>
        <div>
          <h2 className="font-canela text-3xl font-medium tracking-tight text-neutral-400 transition-colors duration-300 group-hover:text-white md:text-6xl">
            {data.name}
          </h2>

          <motion.div
            initial={false}
            animate={{
              height: isActive ? 'auto' : 0,
              marginTop: isActive ? 16 : 0,
              opacity: isActive ? 1 : 0,
              y: isActive ? 0 : -8,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex overflow-hidden"
            aria-label={`${data.name}'s software skills`}
          >
            <div className="flex items-center gap-2">
              {data.skills.map((skill, skillIndex) => (
                <motion.div
                  key={skill.name}
                  initial={false}
                  animate={{ scale: isActive ? 1 : 0.75 }}
                  transition={{
                    duration: 0.25,
                    delay: isActive ? skillIndex * 0.05 : 0,
                  }}
                  title={skill.name}
                  className="relative flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2 backdrop-blur-sm md:size-11"
                >
                  <Image
                    src={skill.icon}
                    alt={`${skill.name} logo`}
                    width={32}
                    height={32}
                    className="size-full object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pl-12 pr-4 md:mt-0 md:justify-end md:gap-12 md:pl-0 md:pr-0">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 transition-colors group-hover:text-neutral-400">
          {data.role}
        </span>

        <div className="block font-canela text-neutral-500 md:hidden">
          {isActive ? <Minus size={18} /> : <Plus size={18} />}
        </div>

        <motion.div
          animate={{ x: isActive ? 0 : -10, opacity: isActive ? 1 : 0 }}
          className="hidden text-white md:block"
        >
          <ArrowUpRight size={28} strokeWidth={1.5} />
        </motion.div>
      </div>
    </>
  );
}