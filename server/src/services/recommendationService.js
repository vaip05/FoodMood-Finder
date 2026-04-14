import {
  BUDGET_RANK,
  DISTANCE_RANK,
  DIETARY_IDS,
} from "../constants/filters.js";

const DEFAULT_MIN = 3;
const DEFAULT_MAX = 5;

function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * @param {string} raw
 * @param {string[]} allowed
 */
function parseListParam(raw, allowed) {
  if (raw == null || raw === "") return [];
  const set = new Set(allowed);
  return String(raw)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && set.has(s));
}

/**
 * Item satisfies dietary needs: every selected need must be met.
 * Vegetarian is also satisfied by vegan-tagged items.
 * @param {object} item
 * @param {string[]} required
 */
function itemMatchesDietary(item, required) {
  if (required.length === 0) return true;
  const tags = new Set(
    Array.isArray(item.dietary) ? item.dietary.map((t) => String(t).toLowerCase()) : []
  );
  for (const need of required) {
    if (need === "vegetarian") {
      if (!tags.has("vegetarian") && !tags.has("vegan")) return false;
    } else if (!tags.has(need)) {
      return false;
    }
  }
  return true;
}

/**
 * @param {object} item
 * @param {number} maxBudgetRank
 * @param {number} maxDistanceRank
 */
function itemMatchesBudgetAndDistance(item, maxBudgetRank, maxDistanceRank) {
  const b = BUDGET_RANK[String(item.budget || "").toLowerCase()];
  const d = DISTANCE_RANK[String(item.distance || "").toLowerCase()];
  if (b == null || d == null) return false;
  return b <= maxBudgetRank && d <= maxDistanceRank;
}

/**
 * @param {object[]} pool
 * @param {{ maxBudgetRank: number; maxDistanceRank: number; dietary: string[] }} filters
 */
export function filterFoodPool(pool, filters) {
  return pool.filter(
    (item) =>
      itemMatchesBudgetAndDistance(item, filters.maxBudgetRank, filters.maxDistanceRank) &&
      itemMatchesDietary(item, filters.dietary)
  );
}

/**
 * @param {Record<string, Array<object>>} moodFoods
 * @param {string} mood
 * @param {{
 *   min?: number;
 *   max?: number;
 *   budget?: string;
 *   distance?: string;
 *   dietary?: string;
 * }} [options]
 */
export function getRecommendationsForMood(moodFoods, mood, options = {}) {
  const key = String(mood || "").toLowerCase().trim();
  const pool = moodFoods[key];

  if (!Array.isArray(pool) || pool.length === 0) {
    return { ok: false, error: "unknown_mood", mood: key };
  }

  const budgetKey = String(options.budget || "high").toLowerCase();
  const distanceKey = String(options.distance || "any").toLowerCase();

  const maxBudgetRank = BUDGET_RANK[budgetKey];
  const maxDistanceRank = DISTANCE_RANK[distanceKey];

  if (maxBudgetRank == null) {
    return { ok: false, error: "invalid_budget", mood: key, budget: budgetKey };
  }
  if (maxDistanceRank == null) {
    return { ok: false, error: "invalid_distance", mood: key, distance: distanceKey };
  }

  const dietary = parseListParam(options.dietary, DIETARY_IDS);
  const unknownDietary = String(options.dietary || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && !DIETARY_IDS.includes(s));
  if (unknownDietary.length > 0) {
    return {
      ok: false,
      error: "invalid_dietary",
      mood: key,
      unknown: unknownDietary,
    };
  }

  const filters = {
    maxBudgetRank,
    maxDistanceRank,
    dietary,
  };

  const filtered = filterFoodPool(pool, filters);
  const matchedCount = filtered.length;

  if (matchedCount === 0) {
    return {
      ok: true,
      mood: key,
      filters: {
        budget: budgetKey,
        distance: distanceKey,
        dietary,
      },
      suggestions: [],
      meta: {
        matchedCount: 0,
        message:
          "Nothing matched those choices for this mood. Try a higher budget or distance, or uncheck a dietary filter.",
      },
    };
  }

  const min = options.min ?? DEFAULT_MIN;
  const max = options.max ?? DEFAULT_MAX;
  const targetCount = Math.min(
    matchedCount,
    Math.max(min, Math.min(max, min + Math.floor(Math.random() * (max - min + 1))))
  );

  const shuffled = shuffleInPlace([...filtered]);
  const suggestions = shuffled.slice(0, targetCount);

  return {
    ok: true,
    mood: key,
    filters: {
      budget: budgetKey,
      distance: distanceKey,
      dietary,
    },
    suggestions,
    meta: {
      matchedCount,
      message:
        matchedCount < min
          ? `Only ${matchedCount} option(s) matched—showing all of them.`
          : null,
    },
  };
}
