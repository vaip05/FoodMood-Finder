function labelFor(options, id) {
  if (!options || !id) return null;
  return options.find((o) => o.id === id)?.label ?? id;
}

export function FoodCard({ food, optionMeta }) {
  const budgets = optionMeta?.budgets;
  const distances = optionMeta?.distances;
  const dietaryOpts = optionMeta?.dietary;

  const budgetLabel = labelFor(budgets, food.budget);
  const distanceLabel = labelFor(distances, food.distance);

  return (
    <article className="food-card">
      {food.imageUrl && (
        <div className="food-card__image-wrap">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="food-card__image"
            loading="lazy"
          />
        </div>
      )}
      <div className="food-card__body">
        <h2 className="food-card__title">{food.name}</h2>
        <div className="food-card__badges" aria-label="Budget, distance, and dietary tags">
          {budgetLabel && (
            <span className="food-badge food-badge--budget">{budgetLabel}</span>
          )}
          {distanceLabel && (
            <span className="food-badge food-badge--distance">{distanceLabel}</span>
          )}
          {Array.isArray(food.dietary) &&
            food.dietary.map((tag) => (
              <span key={tag} className="food-badge food-badge--diet">
                {labelFor(dietaryOpts, tag) ?? tag.replace(/_/g, " ")}
              </span>
            ))}
        </div>
        <p className="food-card__desc">{food.description}</p>
        <p className="food-card__why">
          <span className="food-card__why-label">Why it fits</span>
          {food.whyItMatches}
        </p>
      </div>
    </article>
  );
}
