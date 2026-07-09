const os = require('os');
Object.defineProperty(os, 'cpus', { value: () => [{}] }); // Force 1 CPU to prevent 120+ worker threads

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  // Do not exit, keep the process alive in shared hosting
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
// Fix: Do not use parseInt on port as Hostinger may pass a Unix socket path string
const port = process.env.PORT || 3000;

const app = next({ dev, hostname });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
    .once('error', (err) => {
      console.error('Production server startup failed:', err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Next.js production server ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error preparing Next.js application:', err);
    process.exit(1);
  });
