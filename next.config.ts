import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
    serverActions: {
      bodySizeLimit: '20mb', // or '50mb' if needed
    },
  },
  
};

export default nextConfig;
