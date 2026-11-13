import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Staff can paste any image URL in the admin centre, so remote hosts cannot
    // be enumerated up front. Images are still resized and served through
    // Next's optimiser.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
