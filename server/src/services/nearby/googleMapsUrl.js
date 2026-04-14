/**
 * Universal Google Maps URL (opens app or web).
 * @see https://developers.google.com/maps/documentation/urls/get-started
 */
export function buildGoogleMapsSearchUrl(name, lat, lng) {
  const q = encodeURIComponent(`${name}, ${lat}, ${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/**
 * @param {{ source: string; mapsUrl?: string | null; name: string; lat: number; lng: number }} place
 */
export function googleMapsUrlForPlace(place) {
  if (
    place.source === "google" &&
    place.mapsUrl &&
    place.mapsUrl.includes("google.com/maps")
  ) {
    return place.mapsUrl;
  }
  return buildGoogleMapsSearchUrl(place.name, place.lat, place.lng);
}
