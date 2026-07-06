const os = require('os');
Object.defineProperty(os, 'cpus', { value: () => [{}] }); // Force 1 CPU to prevent 120+ worker threads

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
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
