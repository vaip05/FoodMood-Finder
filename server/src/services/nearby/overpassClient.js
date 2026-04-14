import { haversineMeters } from "./geo.js";

/** Public instances vary in load; we try several before failing. */
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/**
 * Fetch restaurants / cafes / fast food from OpenStreetMap (no API key).
 * For production, prefer GOOGLE_PLACES_API_KEY or self-hosted Overpass.
 */
export async function fetchPlacesOverpass(lat, lng, radiusMeters) {
  const r = Math.min(Math.max(200, Math.round(radiusMeters)), 25000);
  const q = `
[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|cafe|fast_food)$"](around:${r},${lat},${lng});
  way["amenity"~"^(restaurant|cafe|fast_food)$"](around:${r},${lat},${lng});
);
out center;
`.trim();

  const body = `data=${encodeURIComponent(q)}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "FoodMoodFinder/1.0 (https://github.com/)",
  };

  let lastErr = new Error("Overpass: no endpoint tried");
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(28000),
      });
      if (!res.ok) {
        lastErr = new Error(`Overpass HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      return normalizeOverpassElements(data.elements || [], lat, lng);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastErr;
}

function normalizeOverpassElements(elements, userLat, userLng) {
  const out = [];
  const seen = new Set();

  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    const tags = el.tags || {};
    const name = tags.name?.trim();
    if (!name) continue;

    const dedupeKey = `${name.toLowerCase()}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const parts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:city"],
    ].filter(Boolean);
    const address = parts.length > 0 ? parts.join(" ") : null;

    out.push({
      source: "osm",
      sourceId: `${el.type}/${el.id}`,
      name,
      lat,
      lng: lon,
      address,
      cuisine: tags.cuisine || null,
      amenity: tags.amenity || null,
      mapsUrl: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${name} ${lat},${lon}`)}`,
      rawTags: tags,
      distanceMeters: haversineMeters(userLat, userLng, lat, lon),
    });
  }

  return out;
}
