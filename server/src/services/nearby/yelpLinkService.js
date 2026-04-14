const YELP_FUSION_SEARCH = "https://api.yelp.com/v3/businesses/search";

/**
 * Yelp search results page near a point (no API key).
 * Often surfaces the right listing at the top.
 */
export function yelpSearchPageUrl(name, lat, lng) {
  const params = new URLSearchParams({
    find_desc: name.slice(0, 200),
    find_lat: String(lat),
    find_long: String(lng),
  });
  return `https://www.yelp.com/search?${params.toString()}`;
}

function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickYelpBusiness(queryName, businesses) {
  if (!businesses?.length) return null;
  const q = normalizeName(queryName);
  if (!q) return businesses[0];

  for (const b of businesses) {
    const bn = normalizeName(b.name);
    if (!bn) continue;
    if (bn.includes(q) || q.includes(bn)) return b;
  }

  const first = businesses[0];
  if (first.distance != null && first.distance <= 200) return first;
  return null;
}

/**
 * @param {string} name
 * @param {number} lat
 * @param {number} lng
 * @param {string} [apiKey] Yelp Fusion API key (Bearer)
 * @returns {Promise<{ yelpUrl: string; yelpLinkKind: "business" | "search" }>}
 */
export async function resolveYelpLink(name, lat, lng, apiKey) {
  const fallback = yelpSearchPageUrl(name, lat, lng);
  const key = apiKey?.trim();
  if (!key) {
    return { yelpUrl: fallback, yelpLinkKind: "search" };
  }

  try {
    const params = new URLSearchParams({
      term: name.slice(0, 128),
      latitude: String(lat),
      longitude: String(lng),
      limit: "5",
      sort_by: "distance",
    });

    const res = await fetch(`${YELP_FUSION_SEARCH}?${params}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { yelpUrl: fallback, yelpLinkKind: "search" };
    }

    const data = await res.json();
    const best = pickYelpBusiness(name, data.businesses);
    if (best?.url) {
      return { yelpUrl: best.url, yelpLinkKind: "business" };
    }
  } catch {
    /* fall through */
  }

  return { yelpUrl: fallback, yelpLinkKind: "search" };
}
