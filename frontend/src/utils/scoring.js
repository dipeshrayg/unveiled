export function scoreToColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function scoreToLabel(score) {
  if (score >= 80) return "Clean Signal";
  if (score >= 60) return "Moderate Pollution";
  if (score >= 40) return "High Pollution";
  return "Severely Polluted";
}

export function scoreToColorName(score) {
  if (score >= 80) return "GREEN";
  if (score >= 60) return "YELLOW";
  if (score >= 40) return "ORANGE";
  return "RED";
}

export function bubbleToLabel(score) {
  if (score >= 80) return "Strong Echo Chamber";
  if (score >= 60) return "Moderate Filter Bubble";
  if (score >= 40) return "Slight Bubble";
  return "Well Diversified";
}
