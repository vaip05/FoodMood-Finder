import { BUDGET_RANK } from "../../constants/filters.js";
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

function matchesGoogleBudget(priceLevel, maxBudgetRank) {
  if (priceLevel == null) return true;
  const max =
    maxBudgetRank <= 1 ? 1 : maxBudgetRank <= 2 ? 2 : 4;
  return priceLevel <= max;
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
  const hints = moodHintSet(moodKey);
  const radiusMeters = radiusMetersForDistanceTier(distance);
  const maxBudgetRank = BUDGET_RANK[String(budget || "high").toLowerCase()] ?? 3;

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
      matchesGoogleBudget(p.priceLevel, maxBudgetRank)
    );
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
      const distPenalty = p.distanceMeters / 100;
      return { place: p, score: ms - distPenalty, moodScore: ms };
    })
    .sort((a, b) => b.score - a.score);

  const pool = scored.slice(0, Math.min(24, scored.length));
  shuffleInPlace(pool);

  const maxPick = Math.min(5, pool.length);
  const minPick = Math.min(3, maxPick);
  const n =
    maxPick === 0 ? 0 : randomInt(Math.max(1, minPick), maxPick);

  const picked = pool.slice(0, n);

  const dietaryNote =
    dietary.length > 0
      ? "Dietary filters aren’t fully available from map data—confirm with the restaurant before you order."
      : null;

  const restaurantsBase = picked.map(({ place, moodScore: ms }) => ({
    id: `${place.source}-${String(place.sourceId).replace(/\W/g, "_")}`,
    name: place.name,
    distanceMeters: Math.round(place.distanceMeters),
    formattedDistance: formatDistanceMeters(place.distanceMeters),
    address: place.address,
    cuisine: place.cuisine,
    amenity: place.amenity,
    /** Google Maps: directions, hours, Google reviews (opens in Maps app or web). */
    googleMapsUrl: googleMapsUrlForPlace(place),
    /** Raw map source link (OpenStreetMap only; for attribution / power users). */
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
          ? "Results from OpenStreetMap (free). For richer listings, set GOOGLE_PLACES_API_KEY on the server."
          : null,
    },
  };
}

function buildOsmMapsUrl(lat, lng, name) {
  const q = encodeURIComponent(`${name} @ ${lat},${lng}`);
  return `https://www.openstreetmap.org/search?query=${q}`;
}
