import express from "express";
import { registerRoutes } from "../routes";

// Vercel serverless entrypoint. All requests matching /api/* are rewritten to
// this function (see vercel.json), and Express matches them against the routes
// registered below. The frontend is served as static files from dist/.
const app = express();
app.use(express.json());
registerRoutes(app);

export default app;
