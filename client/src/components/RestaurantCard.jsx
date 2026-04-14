export function RestaurantCard({ place }) {
  const mapsHref = place.googleMapsUrl;

  return (
    <article className="restaurant-card">
      <div className="restaurant-card__body">
        <div className="restaurant-card__top">
          <h2 className="restaurant-card__title">
            {mapsHref ? (
              <a
                className="restaurant-card__title-link"
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Maps — directions, hours, and reviews"
              >
                {place.name}
              </a>
            ) : (
              place.name
            )}
          </h2>
          <span className="restaurant-card__dist">{place.formattedDistance}</span>
        </div>
        <div className="restaurant-card__badges">
          {place.cuisine && (
            <span className="restaurant-card__badge">{place.cuisine}</span>
          )}
          {place.amenity && (
            <span className="restaurant-card__badge restaurant-card__badge--muted">
              {String(place.amenity).replace(/_/g, " ")}
            </span>
          )}
          <span className="restaurant-card__badge restaurant-card__badge--src">
            {place.source === "google" ? "Google Places" : "OpenStreetMap"}
          </span>
        </div>
        {place.address && (
          <p className="restaurant-card__addr">{place.address}</p>
        )}
        <p className="restaurant-card__why">
          <span className="restaurant-card__why-label">Why it’s here</span>
          {place.whyItMatches}
        </p>
        <div className="restaurant-card__actions">
          {place.yelpUrl && (
            <a
              className="restaurant-card__link"
              href={place.yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {place.yelpLinkKind === "business"
                ? "Also on Yelp"
                : "Search on Yelp"}
            </a>
          )}
          {place.sourceMapUrl && (
            <a
              className="restaurant-card__link restaurant-card__link--quiet"
              href={place.sourceMapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Raw data on OpenStreetMap
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
