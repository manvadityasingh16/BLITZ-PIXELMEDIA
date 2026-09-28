import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 is the Next default; 90 is for small cropped tiles (the photo arc),
    // where the usual compression artefacts are very visible.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app',
      },
    ],
  },
};

export default nextConfig;
