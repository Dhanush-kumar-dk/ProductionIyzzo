/**
 * Lightweight Zero-dependency Production Node Server for Docker & Self-Hosting
 * Serves Vite static build from /dist, handles API routes from /api, and provides health checks.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const API_DIR = path.join(ROOT_DIR, "api");
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// Lazy cache for API modules
const apiHandlers = new Map();

async function getApiHandler(endpointName) {
  if (apiHandlers.has(endpointName)) {
    return apiHandlers.get(endpointName);
  }
  const filePath = path.join(API_DIR, `${endpointName}.js`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const mod = await import(`file://${filePath}`);
    const handler = mod.default || mod;
    apiHandlers.set(endpointName, handler);
    return handler;
  } catch (err) {
    console.error(`Failed to load API route ${endpointName}:`, err);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // 1. Healthcheck endpoint
  if (pathname === "/api/health" || pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", timestamp: new Date().toISOString(), uptime: process.uptime() }));
    return;
  }

  // 2. API Routes (/api/:route)
  if (pathname.startsWith("/api/")) {
    const routeName = pathname.slice(5).replace(/\.js$/, "");
    const handler = await getApiHandler(routeName);
    if (handler) {
      // Wrap res.status / res.json for Express-like compatibility in Vercel handlers
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };

      // Parse JSON body for POST/PATCH
      if (req.method === "POST" || req.method === "PATCH" || req.method === "PUT") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch {
            req.body = {};
          }
          req.query = Object.fromEntries(url.searchParams);
          try {
            await handler(req, res);
          } catch (handlerErr) {
            console.error(`Error in /api/${routeName}:`, handlerErr);
            if (!res.headersSent) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Internal Server Error" }));
            }
          }
        });
        return;
      }

      req.query = Object.fromEntries(url.searchParams);
      try {
        await handler(req, res);
      } catch (handlerErr) {
        console.error(`Error in /api/${routeName}:`, handlerErr);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
      }
      return;
    }
  }

  // 3. Static Files (from /dist)
  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(DIST_DIR, safePath);

  // Check if file exists, else fallback to index.html (SPA routing)
  let stats;
  try {
    stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      stats = fs.statSync(filePath);
    }
  } catch {
    filePath = path.join(DIST_DIR, "index.html");
    try {
      stats = fs.statSync(filePath);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found - Build artifacts missing. Run 'pnpm run build' first.");
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  // Caching headers
  if (pathname.startsWith("/assets/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  }

  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`🚀 Production server running on http://0.0.0.0:${PORT}`);
});
