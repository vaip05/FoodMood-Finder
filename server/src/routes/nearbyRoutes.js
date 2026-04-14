import { Router } from "express";
import { DIETARY_IDS, MOOD_IDS } from "../constants/filters.js";
import { getNearbyRecommendations } from "../services/nearby/nearbyRecommendationService.js";

function parseDietary(raw) {
  if (raw == null || raw === "") return [];
  const set = new Set(DIETARY_IDS);
  return String(raw)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && set.has(s));
}

/**
 * GET /api/nearby?lat=&lng=&mood=&distance=&budget=&dietary=
 */
export function createNearbyRouter() {
  const router = Router();

  router.get("/nearby", async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      return res.status(400).json({
        error: "invalid_coordinates",
        message:
          "Provide numeric lat and lng (WGS84). Example: ?lat=37.77&lng=-122.42",
      });
    }

    const mood = String(req.query.mood || "happy").toLowerCase();
    if (!MOOD_IDS.includes(mood)) {
      return res.status(400).json({
        error: "unknown_mood",
        message: `Unknown mood "${mood}". Use one of: ${MOOD_IDS.join(", ")}.`,
      });
    }

    const dietary = parseDietary(req.query.dietary);
    const unknown = String(req.query.dietary || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && !DIETARY_IDS.includes(s));
    if (unknown.length > 0) {
      return res.status(400).json({
        error: "invalid_dietary",
        message: `Unknown dietary tag(s): ${unknown.join(", ")}.`,
      });
    }

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY?.trim() || undefined;
    const yelpApiKey = process.env.YELP_API_KEY?.trim() || undefined;

    try {
      const result = await getNearbyRecommendations({
        lat,
        lng,
        mood,
        distance: req.query.distance,
        budget: req.query.budget,
        dietary,
        googleApiKey,
        yelpApiKey,
      });

      res.json({
        ...result,
        count: result.restaurants.length,
      });
    } catch (e) {
      console.error("[nearby]", e);
      res.status(502).json({
        error: "nearby_upstream",
        message:
          e instanceof Error
            ? e.message
            : "Could not load nearby places. Try again in a moment.",
      });
    }
  });

  return router;
}
