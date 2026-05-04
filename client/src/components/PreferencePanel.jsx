export function PreferencePanel({
  budgets,
  distances,
  dietaryOptions,
  budget,
  distance,
  dietarySelected,
  onBudgetChange,
  onDistanceChange,
  onDietaryToggle,
}) {
  return (
    <div className="preference-panel">
      <fieldset className="preference-panel__field">
        <legend className="preference-panel__legend">Budget</legend>
        <p className="preference-panel__hint">Max you want to spend</p>
        <div className="preference-panel__segment">
          {budgets.map((b) => (
            <label key={b.id} className="segment-option">
              <input
                type="radio"
                name="budget"
                value={b.id}
                checked={budget === b.id}
                onChange={() => onBudgetChange(b.id)}
              />
              <span className="segment-option__ui">{b.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="preference-panel__field">
        <legend className="preference-panel__legend">Distance</legend>
        <p className="preference-panel__hint">How far you’ll go for food</p>
        <div className="preference-panel__segment preference-panel__segment--stack">
          {distances.map((d) => (
            <label key={d.id} className="segment-option segment-option--block">
              <input
                type="radio"
                name="distance"
                value={d.id}
                checked={distance === d.id}
                onChange={() => onDistanceChange(d.id)}
              />
              <span className="segment-option__ui">
                <span className="segment-option__title">{d.label}</span>
                <span className="segment-option__desc">{d.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="preference-panel__field">
        <legend className="preference-panel__legend">Dietary Preferences</legend>
        <p className="preference-panel__hint">Optional. Select any that apply</p>
        <div className="preference-panel__checks">
          {dietaryOptions.map((opt) => (
            <label key={opt.id} className="check-option">
              <input
                type="checkbox"
                checked={dietarySelected.includes(opt.id)}
                onChange={() => onDietaryToggle(opt.id)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
