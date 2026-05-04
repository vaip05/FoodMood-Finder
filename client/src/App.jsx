import { useCallback, useEffect, useState } from "react";
import { MoodSelector } from "./components/MoodSelector.jsx";
import { PreferencePanel } from "./components/PreferencePanel.jsx";
import { LocationSection } from "./components/LocationSection.jsx";
import { RestaurantList } from "./components/RestaurantList.jsx";
import { fetchNearby } from "./api/nearby.js";
import { fetchMeta } from "./api/meta.js";
import { DEFAULT_META } from "./constants/filters.js";
import { useGeolocation } from "./hooks/useGeolocation.js";
import "./components/components.css";
import "./App.css";

const MOODS = [
  { id: "happy", label: "Happy" },
  { id: "sad", label: "Sad" },
  { id: "stressed", label: "Stressed" },
  { id: "tired", label: "Tired" },
  { id: "bored", label: "Bored" },
];

export default function App() {
  const [meta, setMeta] = useState(DEFAULT_META);
  const geo = useGeolocation();

  const [selectedMood, setSelectedMood] = useState("happy");
  const [budget, setBudget] = useState("high");
  const [distance, setDistance] = useState("any");
  const [dietarySelected, setDietarySelected] = useState([]);

  const [restaurants, setRestaurants] = useState([]);
  const [nearbyMeta, setNearbyMeta] = useState(null);
  const [nearbySource, setNearbySource] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchMeta().then((data) => {
      if (!cancelled) setMeta(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  
  

  const loadNearby = useCallback(async () => {
    if (geo.lat == null || geo.lng == null) {
      setError("Allow location or wait for it to finish, then try again.");
      return;
    }
    setLoading(true);
    setError(null);
    setNearbyMeta(null);
    try {
      const data = await fetchNearby({
        lat: geo.lat,
        lng: geo.lng,
        mood: selectedMood,
        budget,
        distance,
        dietary: dietarySelected,
      });
      setRestaurants(data.restaurants || []);
      setNearbyMeta(data.meta ?? null);
      setNearbySource(data.source || null);
    } catch (e) {
      setRestaurants([]);
      setNearbyMeta(null);
      setNearbySource(null);
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [geo.lat, geo.lng, selectedMood, budget, distance, dietarySelected]);

  const handlePrimary = () => {
    loadNearby();
  };

  const handleDietaryToggle = (id) => {
    setDietarySelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const nearbyCaption =
    nearbySource === "google"
      ? "Places from Google."
      : "Places from OpenStreetMap.";

  const showOsmHint = !meta.nearby?.googlePlacesConfigured;



  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Food Mood Finder</h1>
        <p className="app__tagline">
          Real spots near you according to mood, budget, distance, and dietary needs.
        </p>
      </header>

      <main className="app__main">
        <section className="panel">
          <LocationSection geo={geo} disabled={loading} />

          {showOsmHint && (
            <p className="panel__hint">
              Tip: set <code className="panel__code">GOOGLE_PLACES_API_KEY</code> in
              your project root <code className="panel__code">.env</code> for richer
              Google Places results.
            </p>
          )}

          <MoodSelector
            moods={MOODS}
            value={selectedMood}
            onChange={setSelectedMood}
          />

          <PreferencePanel
            budgets={meta.budgets}
            distances={meta.distances}
            dietaryOptions={meta.dietary}
            budget={budget}
            distance={distance}
            dietarySelected={dietarySelected}
            onBudgetChange={setBudget}
            onDistanceChange={setDistance}
            onDietaryToggle={handleDietaryToggle}
          />

          <button
            type="button"
            className="btn-primary"
            onClick={handlePrimary}
            disabled={loading || geo.status !== "granted"}
          >
            {loading ? "Searching…" : "Find restaurants"}
          </button>

          {error && (
            <p className="app__error" role="alert">
              {error}
            </p>
          )}
        </section>

        <RestaurantList
          items={restaurants}
          loading={loading}
          meta={nearbyMeta}
          dataSourceLabel={restaurants.length > 0 ? nearbyCaption : null}
        />
      </main>
    </div>
  );
}