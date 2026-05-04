import { RestaurantCard } from "./RestaurantCard.jsx";

export function RestaurantList({
  items,
  loading,
  meta,
  dataSourceLabel,
}) {
  if (loading && items.length === 0) {
    return <p className="suggestion-list__empty">Finding places nearby…</p>;
  }

  if (!loading && items.length === 0 && meta?.message) {
    return (
      <div className="suggestion-list__wrap">
        <p
          className="suggestion-list__banner suggestion-list__banner--warn"
          role="status"
        >
          {meta.message}
        </p>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <p className="suggestion-list__empty">
        Turn on location, then tap <strong>Find restaurants</strong>.
      </p>
    );
  }

  return (
    <div className="suggestion-list__wrap">
      {dataSourceLabel && (
        <p className="restaurant-list__source" role="note">
          {dataSourceLabel}
        </p>
      )}
      <p className="restaurant-list__maps-tip" role="note">
        Tap a restaurant name to open <strong>Google Maps</strong>. Get directions,
        hours, and read reviews there.
      </p>
      {meta?.dietaryNote && (
        <p className="suggestion-list__banner suggestion-list__banner--info">
          {meta.dietaryNote}
        </p>
      )}
      <ul className="suggestion-list">
        {items.map((place) => (
          <li key={place.id} className="suggestion-list__item">
            <RestaurantCard place={place} />
          </li>
        ))}
      </ul>
    </div>
  );
}
