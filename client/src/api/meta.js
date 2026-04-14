import { DEFAULT_META } from "../constants/filters.js";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchMeta() {
  try {
    const res = await fetch(`${API_BASE}/api/meta`);
    if (!res.ok) throw new Error("meta failed");
    return await res.json();
  } catch {
    return DEFAULT_META;
  }
}
