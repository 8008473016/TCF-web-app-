import type { NextConfig } from "next";
import os from 'os';

// Force 1 CPU to prevent 120+ worker threads on shared hosting environments (Hostinger LVE process limit fix)
Object.defineProperty(os, 'cpus', { value: () => [{}] });
try {
  Object.defineProperty(require('node:os'), 'cpus', { value: () => [{}] });
} catch (e) {}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Prevents Sharp from spawning 120+ C++ threads on shared hosting
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
