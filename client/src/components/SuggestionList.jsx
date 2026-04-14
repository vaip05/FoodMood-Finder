import { FoodCard } from "./FoodCard.jsx";

export function SuggestionList({ items, loading, meta, optionMeta }) {
  if (loading && items.length === 0) {
    return <p className="suggestion-list__empty">Loading ideas…</p>;
  }

  if (!loading && items.length === 0 && !meta?.message) {
    return (
      <p className="suggestion-list__empty">
        Set your mood and preferences, then tap <strong>Suggest food</strong>.
      </p>
    );
  }

  return (
    <div className="suggestion-list__wrap">
      {meta?.message && (
        <p
          className={
            items.length === 0
              ? "suggestion-list__banner suggestion-list__banner--warn"
              : "suggestion-list__banner suggestion-list__banner--info"
          }
          role="status"
        >
          {meta.message}
        </p>
      )}
      {items.length > 0 && (
        <ul className="suggestion-list">
          {items.map((item) => (
            <li key={item.id} className="suggestion-list__item">
              <FoodCard food={item} optionMeta={optionMeta} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
