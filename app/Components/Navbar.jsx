"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  // { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="px-4 pt-16 flex justify-center z-10">
      <motion.nav
        initial={{
          width: "30%",
          y:10,
          opacity:0,
        }}
        animate={{
          width: "100%",
          y:0,
          opacity:1,
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
        }}
        aria-label="Main navigation"
        className="hidden mx-auto w-full container rounded-md md:grid grid-cols-2 md:grid-cols-3 items-center z-30"
      >
        <Link
          href="/"
          aria-label="Blitz Pixel Media home"
          className="flex justify-start shrink-0 col-span-1"
          onClick={closeMenu}
        >
          <Image
            className=""
            src="/logos/white.png"
            alt="Blitz Pixel Media"
            width={100}
            height={100}
            priority
          />
        </Link>

        <div className="hidden gap-8 font-bricolage md:flex justify-center col-span-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-sm font-medium transition-colors duration-400 hover:text-orangish-red uppercase ${isActive ? "text-orangish-red" : "text-neutral-500"
                  }`}
              >
                {item.label}

              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex col-span-1 justify-end">
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-md bg-white px-5 font-bricolage text-black text-sm font-semibold transition-colors duration-500 hover:bg-orangish-red hover:text-white"
          >
            Contact
          </Link>
        </div>


      </motion.nav>


      {/* Mobile Nav */}
      <nav className="grid grid-cols-2 md:hidden container relative">
        <Link
          href="/"
          aria-label="Blitz Pixel Media home"
          className="flex justify-start shrink-0 col-span-1"
          onClick={closeMenu}
        >
          <Image
            className=""
            src="/logos/white.png"
            alt="Blitz Pixel Media"
            width={80}
            height={100}
            priority
          />
        </Link>

        {/* Mobile Nav Menu Button */}
        <div className="flex col-span-1 justify-end">
          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex col-span-1 h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white text-black transition-colors hover:bg-almond-cream md:hidden"
          >
            {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>

      {/* Mobile Nav Modal  */}
      <motion.div
        className={`absolute top-10 z-10 mx-auto mt-2 w-full max-w-5xl overflow-hidden rounded-md border border-black/10 bg-white/95 shadow-[0_14px_34px_rgba(0,0,0,0.12)] backdrop-blur transition-all duration-200 md:hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 border-transparent opacity-0"
          }`}
      >
        <div className="flex flex-col p-3 font-bricolage">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={closeMenu}
                className={`rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-almond-cream ${isActive ? "text-orangish-red" : "text-neutral-500"
                  }`}
              >
                {item.label}
              </Link>

            );
          })}

          <Link
            href="/contact"
            onClick={closeMenu}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-md bg-black px-5 font-bricolage text-sm font-semibold text-orangish-red transition-colors hover:bg-orangish-red hover:text-white"
          >
            Contact
          </Link>
        </div>
      </motion.div>

      </nav>

    </header>
  );
}
