export function ModeTabs({ value, onChange }) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="Recommendation mode">
      <button
        type="button"
        role="tab"
        aria-selected={value === "nearby"}
        className={
          value === "nearby" ? "mode-tabs__btn mode-tabs__btn--active" : "mode-tabs__btn"
        }
        onClick={() => onChange("nearby")}
      >
        Near me
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "ideas"}
        className={
          value === "ideas" ? "mode-tabs__btn mode-tabs__btn--active" : "mode-tabs__btn"
        }
        onClick={() => onChange("ideas")}
      >
        Meal ideas
      </button>
    </div>
  );
}
