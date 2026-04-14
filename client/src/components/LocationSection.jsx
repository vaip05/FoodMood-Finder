export function LocationSection({ geo, disabled }) {
  const { status, lat, lng, error, request, clear } = geo;

  return (
    <div className="location-section">
      <div className="location-section__row">
        <button
          type="button"
          className="btn-secondary"
          onClick={request}
          disabled={disabled || status === "requesting"}
        >
          {status === "requesting" ? "Locating…" : "Use my location"}
        </button>
        {status === "granted" && (
          <button type="button" className="btn-text" onClick={clear}>
            Clear
          </button>
        )}
      </div>
      {status === "granted" && lat != null && lng != null && (
        <p className="location-section__ok" role="status">
          Using your position ({lat.toFixed(3)}, {lng.toFixed(3)}). Results use
          your “Distance” setting as search radius.
        </p>
      )}
      {error && (status === "denied" || status === "error") && (
        <p className="location-section__err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
