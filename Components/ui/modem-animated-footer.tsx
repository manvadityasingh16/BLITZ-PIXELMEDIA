"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  brandIcon?: React.ReactNode;
  className?: string;
}

export const Footer = ({
  brandName = "YourBrand",
  brandDescription = "Your description here",
  socialLinks = [],
  navLinks = [],
  creatorName,
  creatorUrl,
  brandIcon,
  className,
}: FooterProps) => {
  const creatorUrlIsExternal = creatorUrl?.startsWith("http");

  return (
    <section className={cn("relative mt-0 w-full overflow-hidden", className)}>
      <footer className="relative mt-20 bg-background">
        <div className="relative mx-auto flex min-h-[20rem] max-w-7xl flex-col justify-between p-4 py-10 sm:min-h-[35rem] md:min-h-[30rem]">
          <div className="mb-12 flex w-full flex-col sm:mb-20 md:mb-0">
            <div className="flex w-full flex-col items-center">
              <div className="flex flex-1 flex-col items-center space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground text-3xl lg:text-4xl font-light font-canela tracking-tight text-orangish-red">
                    {brandName}
                  </span>
                </div>
                <p className="w-full max-w-sm px-4 text-center text-foreground text-muted-foreground sm:w-96 sm:px-0">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="mb-8 mt-3 flex gap-4">
                  {socialLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="h-6 w-6 duration-300 hover:scale-110">
                        {link.icon}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="flex max-w-full flex-wrap justify-center gap-4 px-4 text-sm font-medium text-muted-foreground">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      className="duration-300 hover:font-semibold hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center justify-center gap-2 px-4 md:mt-24 md:flex-row md:items-center md:justify-between md:gap-1 md:px-0">
            <p className="text-center text-base text-muted-foreground md:text-left">
              &copy;{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <Link
                  href={'https://graphicmoron.vercel.app/'}
                  target={creatorUrlIsExternal ? "_blank" : undefined}
                  rel={creatorUrlIsExternal ? "noopener noreferrer" : undefined}
                  className="group relative text-base text-muted-foreground transition-colors duration-300 hover:font-medium hover:text-foreground"
                >
                  Crafted by Graphic Moron
                </Link>
              </nav>
            )}
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-40 left-1/2 max-w-[95vw] -translate-x-1/2 select-none bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent bg-clip-text px-4 text-center font-extrabold leading-none tracking-normal text-transparent md:bottom-32"
          style={{ fontSize: "clamp(3rem, 12vw, 8rem)" }}
        >
          {brandName.toUpperCase()}
        </div>

        <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-3xl border-2 border-border bg-background/60 p-3 backdrop-blur-sm drop-shadow-[0_0px_20px_rgba(0,0,0,0.5)] duration-300 hover:border-foreground dark:drop-shadow-[0_0px_20px_rgba(255,255,255,0.3)] md:bottom-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 shadow-lg sm:h-16 sm:w-16 md:h-24 md:w-24">
            {brandIcon || (
              <Image src="/logo.png" alt="Blitz Pixel Media"
                width={200}
                height={80} className="w-[400px] h-full" />
            )}
          </div>
        </div>

        <div className="absolute bottom-32 left-1/2 h-1 w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent backdrop-blur-sm sm:bottom-34" />

        <div className="absolute bottom-28 h-24 w-full bg-gradient-to-t from-background via-background/80 to-background/40 blur-[1em]" />
      </footer>
    </section>
  );
};
