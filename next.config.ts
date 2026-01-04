import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build for VDS/Docker deployment
  output: "standalone",

  // Disable powered by header for security
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Ensure unique build ID for cache busting
  generateBuildId: async () => {
    // You can use a timestamp or git commit hash here
    return `build-${Date.now()}`
  },

  // Strict mode for better error catching
  reactStrictMode: true,
};

export default nextConfig;
