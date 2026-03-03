import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
      },
    ],
  },
};

export default nextConfig;
