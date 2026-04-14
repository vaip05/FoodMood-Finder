/** @type {Record<string, number>} lower rank = cheaper */
export const BUDGET_RANK = { low: 1, medium: 2, high: 3 };

/** @type {Record<string, number>} lower rank = closer / less travel */
export const DISTANCE_RANK = { walk: 1, short: 2, medium: 3, any: 4 };

/** Dietary tag ids stored on each food item (item must satisfy selected needs). */
export const DIETARY_IDS = [
  "vegetarian",
  "vegan",
  "gluten_free",
  "dairy_free",
  "nut_free",
];

/** Labels for API `/api/meta` and docs */
export const FILTER_LABELS = {
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
};

export const MOOD_IDS = ["happy", "sad", "stressed", "tired", "bored"];
