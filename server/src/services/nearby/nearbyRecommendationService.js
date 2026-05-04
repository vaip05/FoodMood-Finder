//import { BUDGET_RANK } from "../../constants/filters.js";
import { moodHintSet } from "./moodPlaceHints.js";
import { radiusMetersForDistanceTier } from "./distanceRadius.js";
import { formatDistanceMeters } from "./geo.js";
import { fetchPlacesOverpass } from "./overpassClient.js";
import { fetchPlacesGoogleNearby } from "./googlePlacesClient.js";
import { resolveYelpLink } from "./yelpLinkService.js";
import { googleMapsUrlForPlace } from "./googleMapsUrl.js";

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function textBlob(place) {
  const cuisine = (place.cuisine || "").toLowerCase();
  const name = (place.name || "").toLowerCase();
  const amenity = (place.amenity || "").toLowerCase();
  const types = (place.types || []).join(" ").toLowerCase();
  return `${cuisine} ${name} ${amenity} ${types}`;
}

function moodScore(place, hints) {
  const blob = textBlob(place);
  let s = 0;

  for (const h of hints) {
    const needle = h.replace(/_/g, " ");
    if (blob.includes(h) || blob.includes(needle)) s += 4;
  }

  return s;
}

function matchesGoogleBudget(priceLevel, budgetKey) {
  if (priceLevel == null) return true;

  if (
    budgetKey === "low" ||
    budgetKey === "budget" ||
    budgetKey === "budget-friendly"
  ) {
    return priceLevel <= 2;
  }

  if (budgetKey === "moderate" || budgetKey === "medium") {
    return priceLevel <= 3;
  }

  return true;
}

function budgetScore(place, budget) {
  const price = place.priceLevel;

  // OpenStreetMap often does not provide price data.
  if (price == null) return 0;

  const budgetKey = String(budget || "high").toLowerCase();

  if (
    budgetKey === "low" ||
    budgetKey === "budget" ||
    budgetKey === "budget-friendly"
  ) {
    if (price <= 1) return 8;
    if (price === 2) return 2;
    return -6;
  }

  if (budgetKey === "moderate" || budgetKey === "medium") {
    if (price === 2) return 8;
    if (price === 1 || price === 3) return 3;
    return -3;
  }

  if (
    budgetKey === "high" ||
    budgetKey === "splurge" ||
    budgetKey === "expensive"
  ) {
    if (price >= 3) return 10;
    if (price === 2) return 1;
    return -8;
  }

  return 0;
}

function whyLine(mood, place, moodScorePts) {
  const bits = [];

  if (place.cuisine) bits.push(`${place.cuisine} food`);

  if (place.amenity === "cafe" || place.amenity === "bakery") {
    bits.push("a quick bite or drink");
  }

  if (moodScorePts >= 4) {
    bits.push(`leans into a “${mood}” kind of pick`);
  }

  const tail =
    bits.length > 0
      ? `${bits[0]}${bits[1] ? ` — ${bits[1]}` : ""}.`
      : "Worth a look based on what’s around you.";

  return `Real spot on the map: ${tail}`;
}

function normalizeRestaurantName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\brestaurant\b/g, "")
    .replace(/\bgrill\b/g, "")
    .replace(/\bcafe\b/g, "")
    .replace(/\bthe\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function dedupeByName(items) {
  const seen = new Set();

  return items.filter((item) => {
    const nameKey = normalizeRestaurantName(item.place?.name);

    if (!nameKey) return false;
    if (seen.has(nameKey)) return false;

    seen.add(nameKey);
    return true;
  });
}

/**
 * @param {{
 *   lat: number;
 *   lng: number;
 *   mood: string;
 *   distance: string;
 *   budget: string;
 *   dietary?: string[];
 *   googleApiKey: string | undefined;
 *   yelpApiKey: string | undefined;
 * }} opts
 */
export async function getNearbyRecommendations(opts) {
  const {
    lat,
    lng,
    mood,
    distance,
    budget,
    dietary = [],
    googleApiKey,
    yelpApiKey,
  } = opts;

  const moodKey = String(mood || "happy").toLowerCase().trim();
  const budgetKey = String(budget || "high").toLowerCase().trim();
  const hints = moodHintSet(moodKey);
  const radiusMeters = radiusMetersForDistanceTier(distance);
  //const maxBudgetRank = BUDGET_RANK[budgetKey] ?? 3;

  let raw = [];
  let source = "osm";

  if (googleApiKey) {
    try {
      raw = await fetchPlacesGoogleNearby(lat, lng, radiusMeters, googleApiKey);
      source = "google";
    } catch {
      raw = await fetchPlacesOverpass(lat, lng, radiusMeters);
      source = "osm";
    }
  } else {
    raw = await fetchPlacesOverpass(lat, lng, radiusMeters);
  }

  let filtered = raw.filter((p) => p.distanceMeters <= radiusMeters * 1.05);

  if (source === "google") {
    filtered = filtered.filter((p) =>
      matchesGoogleBudget(p.priceLevel, budgetKey)
    );
  }

  if (
    source === "google" &&
    (budgetKey === "high" || budgetKey === "splurge" || budgetKey === "expensive")
  ) {
    const expensive = filtered.filter((p) => p.priceLevel >= 3);
  
    if (expensive.length >= 2) {
      filtered = expensive;
    } else {
      filtered = filtered.filter((p) => p.priceLevel == null || p.priceLevel >= 2);
    }
  }

  if (filtered.length === 0) {
    return {
      ok: true,
      source,
      mood: moodKey,
      radiusMeters,
      restaurants: [],
      meta: {
        message:
          "No places showed up in this radius. Try “Any distance” or move the pin—OpenStreetMap coverage varies by area.",
      },
    };
  }

  const scored = filtered
  .map((p) => {
    const ms = moodScore(p, hints);
    const bs = budgetScore(p, budgetKey);
    const distPenalty = p.distanceMeters / 100;

    const typeBonus =
      p.amenity === "restaurant"
        ? 6
        : p.amenity === "fast_food"
        ? 3
        : p.amenity === "cafe"
        ? -5
        : 0;

    return {
      place: p,
      score: ms + bs + typeBonus - distPenalty,
      moodScore: ms,
      budgetScore: bs,
    };
  })
  .sort((a, b) => b.score - a.score);

  const deduped = dedupeByName(scored);
  const pool = deduped.slice(0, Math.min(24, deduped.length));
  shuffleInPlace(pool);

  const maxPick = Math.min(5, pool.length);
  const minPick = Math.min(3, maxPick);
  const n = maxPick === 0 ? 0 : randomInt(Math.max(1, minPick), maxPick);

  const picked = [];
let cafeCount = 0;

for (const item of pool) {
  const amenity = item.place.amenity;

  if (amenity === "cafe" && cafeCount >= 1) continue;

  if (amenity === "cafe") cafeCount++;

  picked.push(item);

  if (picked.length >= n) break;
}

  const dietaryNote =
    dietary.length > 0
      ? "As always with dietary restrictions, please confirm with the restaurant before you order."
      : null;

  const restaurantsBase = picked.map(({ place, moodScore: ms }) => ({
    id: `${place.source}-${String(place.sourceId).replace(/\W/g, "_")}`,
    name: place.name,
    distanceMeters: Math.round(place.distanceMeters),
    formattedDistance: formatDistanceMeters(place.distanceMeters),
    address: place.address,
    cuisine: place.cuisine,
    amenity: place.amenity,
    priceLevel: place.priceLevel,
    rating: place.rating,
    googleMapsUrl: googleMapsUrlForPlace(place),
    sourceMapUrl:
      place.source === "osm"
        ? place.mapsUrl || buildOsmMapsUrl(place.lat, place.lng, place.name)
        : null,
    whyItMatches: whyLine(moodKey, place, ms),
    source: place.source,
    _lat: place.lat,
    _lng: place.lng,
  }));

  const restaurants = await Promise.all(
    restaurantsBase.map(async (r) => {
      const { yelpUrl, yelpLinkKind } = await resolveYelpLink(
        r.name,
        r._lat,
        r._lng,
        yelpApiKey
      );

      const { _lat, _lng, ...pub } = r;
      return { ...pub, yelpUrl, yelpLinkKind };
    })
  );

  return {
    ok: true,
    source,
    mood: moodKey,
    radiusMeters,
    restaurants,
    meta: {
      matchedCount: filtered.length,
      dietaryNote,
      message:
        source === "osm"
          ? "Results from OpenStreetMap (free). For richer listings, set GOOGLE_PLACES_API_KEY on the server. Budget accuracy is better with Google Places because OpenStreetMap often does not include price data."
          : null,
    },
  };
}

function buildOsmMapsUrl(lat, lng, name) {
  const q = encodeURIComponent(`${name} @ ${lat},${lng}`);
  return `https://www.openstreetmap.org/search?query=${q}`;
}

