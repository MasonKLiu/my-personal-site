import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ===  GitHub Pages 靜態匯出所需的設定 ===
  output: "export",
  images: {
    unoptimized: true,
  },

  // === 原本的專案設定 ===
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
