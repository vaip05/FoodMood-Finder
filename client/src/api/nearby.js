const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * @param {{
 *   lat: number;
 *   lng: number;
 *   mood: string;
 *   budget?: string;
 *   distance?: string;
 *   dietary?: string[];
 * }} params
 */
export async function fetchNearby(params) {
  const { lat, lng, mood, budget = "high", distance = "any", dietary = [] } =
    params;
  const search = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    mood,
    budget,
    distance,
  });
  if (dietary.length > 0) {
    search.set("dietary", dietary.join(","));
  }

  const res = await fetch(`${API_BASE}/api/nearby?${search.toString()}`);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return res.json();
}
