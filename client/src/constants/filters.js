/** Fallback if `/api/meta` is unavailable (kept in sync with server `FILTER_LABELS`). */
export const DEFAULT_META = {
  moods: ["happy", "sad", "stressed", "tired", "bored"],
  budgets: [
    { id: "low", label: "Budget-friendly", description: "Keep it cheap" },
    { id: "medium", label: "Moderate", description: "Comfortable spend" },
    { id: "high", label: "Splurge", description: "Treat yourself" },
  ],
  distances: [
    { id: "walk", label: "Walking distance", description: "Home, desk, or next block" },
    { id: "short", label: "Short trip", description: "Quick errand nearby" },
    { id: "medium", label: "Willing to drive", description: "A bit farther for the right thing" },
    { id: "any", label: "Any distance", description: "Delivery or a real outing is fine" },
  ],
  dietary: [
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "gluten_free", label: "Gluten-free" },
    { id: "dairy_free", label: "Dairy-free" },
    { id: "nut_free", label: "Nut-free" },
  ],
  nearby: {
    googlePlacesConfigured: false,
    yelpFusionConfigured: false,
    defaultDataSource: "openstreetmap",
  },
};
