/**
 * Keywords (cuisine, amenity, name) used to score OSM/Google results for a mood.
 * Not exhaustive—tunable as you expand the app.
 */
export const MOOD_PLACE_HINTS = {
  happy: [
    "ice_cream",
    "frozen_yogurt",
    "dessert",
    "brunch",
    "breakfast",
    "pizza",
    "mexican",
    "thai",
    "japanese",
    "sushi",
    "bubble_tea",
    "juice",
    "smoothie",
    "cafe",
    "bakery",
    "patisserie",
  ],
  sad: [
    "soup",
    "ramen",
    "noodle",
    "american",
    "diner",
    "italian",
    "comfort",
    "burger",
    "grill",
    "pub",
    "irish",
    "southern",
  ],
  stressed: [
    "salad",
    "sushi",
    "japanese",
    "vietnamese",
    "thai",
    "healthy",
    "juice",
    "smoothie",
    "cafe",
    "tea",
    "mediterranean",
    "poke",
  ],
  tired: [
    "fast_food",
    "sandwich",
    "cafe",
    "pizza",
    "burger",
    "diner",
    "breakfast",
    "coffee",
    "bakery",
    "mexican",
  ],
  bored: [
    "korean",
    "ethiopian",
    "indian",
    "thai",
    "vietnamese",
    "japanese",
    "tapas",
    "fusion",
    "barbecue",
    "bbq",
    "hot_pot",
    "dim_sum",
  ],
};

export function moodHintSet(mood) {
  const key = String(mood || "").toLowerCase().trim();
  const list = MOOD_PLACE_HINTS[key] || MOOD_PLACE_HINTS.happy;
  return new Set(list);
}
