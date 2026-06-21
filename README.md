<div align="center">
<img width="200" alt="Brainy logo" src="logo_brainy.jpeg" />
</div>

# Brainy — Academic Course & Feedback Hub

A polished, interactive student portal and educational dashboard: dashboard, courses,
grades, academic calendar, chat messaging, settings, a library explorer, and an AI
feedback/prioritization advisor. The frontend is **React + Vite + Tailwind**; an
**Express** backend exposes AI endpoints (Google Gemini) and a Moodle sync endpoint.

## Architecture

- `src/` — React single-page app (Vite).
- `routes.ts` — all API route handlers, shared by both runtimes below.
- `server.ts` — local Node/Express server. In dev it runs Vite as middleware; in
  production it serves the built `dist/` and the API on one port.
- `api/index.ts` — Vercel serverless entrypoint that reuses `routes.ts`.
- `vercel.json` — Vercel build + routing config.

### API endpoints

| Method | Path                        | Purpose                                  |
| ------ | --------------------------- | ---------------------------------------- |
| POST   | `/api/ai/chat`              | Library AI chat assistant                |
| POST   | `/api/ai/summarize`         | Summarize a library resource             |
| POST   | `/api/ai/recommend`         | Recommend books/resources for a topic    |
| POST   | `/api/ai/feedback-assistant`| Feedback analysis & prioritization advice|
| POST   | `/api/ai/feedbacks-filter`  | AI filtering of feedback submissions     |
| POST   | `/api/moodle/sync`          | Moodle course sync (live or sandbox)     |

## Run locally

**Prerequisites:** Node.js 18+ (tested on 22).

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your Gemini API key in `.env.local` (already created; get a key at
   https://aistudio.google.com/apikey):
   ```
   GEMINI_API_KEY="your-real-key"
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000. The Moodle sync works without a key (sandbox mode);
   AI features require a valid `GEMINI_API_KEY`.

Other scripts: `npm run build` (local prod bundle), `npm start` (serve the local
prod bundle), `npm run lint` (typecheck).

## Deploy to Vercel

This repo is Vercel-ready via `vercel.json`:

- `vite build` produces the static frontend in `dist/`.
- `api/index.ts` is deployed as a serverless function; `/api/*` requests are routed
  to it, everything else falls back to the SPA's `index.html`.

Steps:

1. Push this project to a Git repository and import it in Vercel (or run
   `npx vercel`). Set the **Root Directory** to `brainy` if you import the parent repo.
2. In **Project → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your Gemini API key
3. Deploy. Vercel uses the build command and output directory from `vercel.json`
   automatically — no extra configuration needed.
