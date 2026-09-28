'use client';

import Aboutus from './Components/Home/Aboutus';
import Loop from './Components/Home/Loop';
import LogoCloud from './Components/Home/Tools';
import Hero2 from './Components/Home/Hero2';
import Team from './Components/Home/Team';
import BookMeet from './Components/BookMeet';
import VideoIntro from './Components/Home/VideoIntro';
import { useEffect } from 'react';
import Lenis from 'lenis';
import ScrollProgress from './Components/ScrollProgress';
import { DesignHelpCTA } from '@/Components/ui/design-help-cta';
import AboutSection from './Components/AboutSection';

export default function Home() {

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <>
      <div className='mx-auto relative w-full'>

        <section className="mx-auto container ">
          <Hero2 />
        </section>

        {/* <LogoCloud /> */}

        <section className="mx-auto mask-t-from-80% mask-b-from-60% ">
          <div className="min-h-screen w-full bg-black relative text-white flex flex-col items-center justify-center overflow-hidden">
            {/* Variable Spacing Pattern */}
            <div
              className="absolute inset-0 z-0 pointer-events-none opacity-80 "
              style={{
                backgroundImage: `
        repeating-linear-gradient(30deg, 
          rgba(255, 100, 0, 0.1) 0, 
          rgba(255, 100, 0, 0.1) 1px, 
          transparent 1px, 
          transparent 10px,
          rgba(255, 100, 0, 0.15) 11px, 
          rgba(255, 100, 0, 0.15) 12px, 
          transparent 12px, 
          transparent 40px
        )
      `,
              }}
            />
            <AboutSection />
          </div>


        </section>
        <section className="-mt-50">
          <VideoIntro />
        </section>

        {/* <Aboutus /> */}

        {/* <BookMeet /> */}

        {/* <div className="mt-68">
          <Loop />
        </div> */}

        {/* <IntegrationCard /> */}

        <Team />
        {/* DESIGN-HELP CTA */}
        <section className="relative z-10 px-6 md:px-12 mt-20">
          <DesignHelpCTA />
        </section>
        <ScrollProgress />
      </div>

    </>
  );
}