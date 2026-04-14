import { Router } from "express";
import { getRecommendationsForMood } from "../services/recommendationService.js";

/**
 * @param {Record<string, Array<object>>} moodFoods
 */
export function createRecommendRouter(moodFoods) {
  const router = Router();

  router.get("/recommend", (req, res) => {
    const mood = req.query.mood;
    const budget = req.query.budget;
    const distance = req.query.distance;
    const dietary = req.query.dietary;

    const result = getRecommendationsForMood(moodFoods, mood, {
      budget,
      distance,
      dietary,
    });

    if (!result.ok) {
      if (result.error === "unknown_mood") {
        return res.status(400).json({
          error: result.error,
          message: `Unknown mood "${result.mood}". Try: happy, sad, stressed, tired, bored.`,
        });
      }
      if (result.error === "invalid_budget") {
        return res.status(400).json({
          error: result.error,
          message: `Invalid budget "${result.budget}". Use: low, medium, high.`,
        });
      }
      if (result.error === "invalid_distance") {
        return res.status(400).json({
          error: result.error,
          message: `Invalid distance "${result.distance}". Use: walk, short, medium, any.`,
        });
      }
      if (result.error === "invalid_dietary") {
        return res.status(400).json({
          error: result.error,
          message: `Unknown dietary tag(s): ${result.unknown.join(", ")}.`,
        });
      }
      return res.status(400).json({ error: result.error });
    }

    res.json({
      mood: result.mood,
      filters: result.filters,
      count: result.suggestions.length,
      suggestions: result.suggestions,
      meta: result.meta,
    });
  });

  return router;
}
