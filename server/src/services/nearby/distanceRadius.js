import { DISTANCE_RANK } from "../../constants/filters.js";

/** Search radius (meters) aligned with user’s “how far” preference. */
const RADIUS_BY_TIER = {
  walk: 700,
  short: 2200,
  medium: 6500,
  any: 14000,
};

export function radiusMetersForDistanceTier(tier) {
  const key = String(tier || "any").toLowerCase();
  if (DISTANCE_RANK[key] == null) return RADIUS_BY_TIER.any;
  return RADIUS_BY_TIER[key] ?? RADIUS_BY_TIER.any;
}
