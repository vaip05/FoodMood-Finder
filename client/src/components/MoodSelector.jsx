export function MoodSelector({ moods, value, onChange }) {
  return (
    <div className="mood-selector">
      <label htmlFor="mood-select" className="mood-selector__label">
        How are you feeling?
      </label>
      <select
        id="mood-select"
        className="mood-selector__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {moods.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <div className="mood-selector__chips" aria-hidden>
        {moods.map((m) => (
          <button
            key={m.id}
            type="button"
            className={
              m.id === value
                ? "mood-chip mood-chip--active"
                : "mood-chip"
            }
            onClick={() => onChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
