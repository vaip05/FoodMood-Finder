import { haversineMeters } from "./geo.js";

const SEARCH_NEARBY_URL =
  "https://places.googleapis.com/v1/places:searchNearby";

/** Maps Google price level string to 1–4 (higher = pricier). */
const PRICE_RANK = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

/**
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusMeters
 * @param {string} apiKey
 */
export async function fetchPlacesGoogleNearby(lat, lng, radiusMeters, apiKey) {
  const radius = Math.min(Math.max(200, radiusMeters), 50000);
  const body = {
    includedTypes: [
      "restaurant",
      "cafe",
      "fast_food_restaurant",
      "meal_takeaway",
      "bakery",
      "bar",
    ],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius,
      },
    },
  };

  const res = await fetch(SEARCH_NEARBY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.priceLevel,places.types,places.googleMapsUri",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Places ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const places = data.places || [];
  return places.map((p) => normalizeGooglePlace(p, lat, lng));
}

function normalizeGooglePlace(place, userLat, userLng) {
  const loc = place.location || {};
  const plat = loc.latitude;
  const plng = loc.longitude;
  const name = place.displayName?.text || "Unknown place";
  const priceLevel = place.priceLevel
    ? PRICE_RANK[place.priceLevel] ?? null
    : null;

  return {
    source: "google",
    sourceId: place.id?.replace(/^places\//, "") || name,
    name,
    lat: plat,
    lng: plng,
    address: place.formattedAddress || null,
    cuisine: inferCuisineFromTypes(place.types),
    amenity: primaryAmenityFromTypes(place.types),
    types: place.types || [],
    priceLevel,
    mapsUrl: place.googleMapsUri || mapsUrlFallback(plat, plng, name),
    distanceMeters:
      plat != null && plng != null
        ? haversineMeters(userLat, userLng, plat, plng)
        : 0,
    rawTags: {},
  };
}

function primaryAmenityFromTypes(types) {
  if (!types?.length) return "restaurant";
  if (types.includes("cafe")) return "cafe";
  if (types.includes("bakery")) return "bakery";
  if (types.includes("bar")) return "bar";
  if (types.includes("fast_food_restaurant")) return "fast_food";
  return "restaurant";
}

function inferCuisineFromTypes(types) {
  const cuisineTypes = types?.filter(
    (t) =>
      t.endsWith("_restaurant") &&
      !["fast_food_restaurant", "meal_takeaway"].includes(t)
  );
  if (!cuisineTypes?.length) return null;
  return cuisineTypes[0].replace(/_restaurant$/, "").replace(/_/g, " ");
}

function mapsUrlFallback(lat, lng, name) {
  if (lat == null || lng == null) return null;
  const q = encodeURIComponent(`${name} ${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
