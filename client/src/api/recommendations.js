const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * @param {{
 *   mood: string;
 *   budget?: string;
 *   distance?: string;
 *   dietary?: string[];
 * }} params
 */
export async function fetchRecommendations(params) {
  const { mood, budget = "high", distance = "any", dietary = [] } = params;
  const search = new URLSearchParams({ mood, budget, distance });
  if (dietary.length > 0) {
    search.set("dietary", dietary.join(","));
  }
  const url = `${API_BASE}/api/recommend?${search.toString()}`;
  const res = await fetch(url);

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
