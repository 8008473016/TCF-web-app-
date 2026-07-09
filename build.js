const os = require('os');
// Force 1 CPU to prevent Next.js from spawning 120+ Webpack/Terser/SWC worker threads on shared hosting (Hostinger)
Object.defineProperty(os, 'cpus', { value: () => [{}] });
try {
  Object.defineProperty(require('node:os'), 'cpus', { value: () => [{}] });
} catch (e) {}

// Limit Rust (Turbopack/SWC) and Node worker threads natively
process.env.RAYON_NUM_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';
process.env.NEXT_PRIVATE_WORKER_THREADS = '1';

// Start Next.js CLI in the same process so the OS mock is active
process.argv.splice(2, 0, 'build'); // inject 'build' command if not present, though we will run `node build.js build` anyway
require('next/dist/bin/next');
