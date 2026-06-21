import path from "path";
import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import app from "./api/index";

// Load .env.local first (developer's real key), then fall back to .env.
// Values already present in the environment are not overridden.
dotenv.config({ path: [".env.local", ".env"] });

const PORT = Number(process.env.PORT) || 3000;

// `app` already has express.json() and all API routes registered (api/index.ts).
// Here we only add frontend serving for local dev/prod and start listening.
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode — Vite as middleware.
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode — serve the built SPA.
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
