import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Loads mood → food mappings from JSON. Keeps data out of route handlers for easy expansion.
 */
export function loadMoodFoods() {
  const path = join(__dirname, "../../data/moodFoods.json");
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw);
}
