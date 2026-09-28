import type { Metadata } from "next";
import "./globals.css";
import Navbar from './Components/Navbar';
import FolderBanner from './Components/FolderBanner';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Footer } from '@/Components/ui/modem-animated-footer';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Blitz Pixel Media",
  description: "Digital Content Creation and Cinematography Agency",
};

const footerNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased', "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-black selection:bg-orangish-red selection:text-white">
        <FolderBanner />
        <Navbar />
        {children}
        <Footer
          brandName="BlitzPixelMedia"
          brandDescription="Digital experiences, brand systems, and creative websites built with clarity and momentum."
          navLinks={footerNavLinks}
          creatorName="BlitzPixelMedia"
          creatorUrl="/"
        />
      </body>
    </html>
  );
}
