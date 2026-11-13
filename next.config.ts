import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Limit build workers to 1 on Windows to avoid filesystem EPERM race conditions on mkdir
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
