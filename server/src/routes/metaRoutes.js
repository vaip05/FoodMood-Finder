import { Router } from "express";
import { FILTER_LABELS, MOOD_IDS } from "../constants/filters.js";

export function createMetaRouter() {
  const router = Router();

  router.get("/meta", (_req, res) => {
    const google = Boolean(
      String(process.env.GOOGLE_PLACES_API_KEY || "").trim()
    );
    const yelp = Boolean(String(process.env.YELP_API_KEY || "").trim());
    res.json({
      moods: MOOD_IDS,
      ...FILTER_LABELS,
      nearby: {
        googlePlacesConfigured: google,
        yelpFusionConfigured: yelp,
        defaultDataSource: google ? "google_places" : "openstreetmap",
      },
    });
  });

  return router;
}
