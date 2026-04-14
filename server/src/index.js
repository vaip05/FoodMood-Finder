import "./env.js";
import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMoodFoods } from "./data/loadMoodFoods.js";
import { createRecommendRouter } from "./routes/recommendRoutes.js";
import { createMetaRouter } from "./routes/metaRoutes.js";
import { createNearbyRouter } from "./routes/nearbyRoutes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, "../../client/dist");

const PORT = Number(process.env.PORT) || 3001;
const moodFoods = loadMoodFoods();

const app = express();
app.use(cors({ origin: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "food-mood-finder" });
});

const recommendRouter = createRecommendRouter(moodFoods);
const metaRouter = createMetaRouter();
const nearbyRouter = createNearbyRouter();
app.use(recommendRouter);
app.use("/api", recommendRouter);
app.use(metaRouter);
app.use("/api", metaRouter);
app.use(nearbyRouter);
app.use("/api", nearbyRouter);

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

app.listen(PORT, () => {
  console.log(`Food Mood Finder API listening on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/recommend?mood=happy`);
  console.log(
    `Nearby: http://localhost:${PORT}/api/nearby?lat=37.77&lng=-122.42&mood=happy`
  );
});
