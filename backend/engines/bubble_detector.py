"""
Filter Bubble Detector.
Analyzes domain diversity across political, topical, and geographic dimensions.
"""

import math
from engines.source_credibility import get_domain_political_lean, get_domain_topic_category, extract_domain

POLITICAL_CATEGORIES = {"left", "center-left", "center", "center-right", "right", "far-right", "far-left"}
KNOWN_INTERNATIONAL = {
    "bbc.com", "bbc.co.uk", "theguardian.com", "ft.com", "economist.com",
    "aljazeera.com", "dw.com", "france24.com", "rt.com", "thehindu.com",
    "scmp.com", "globo.com", "lemonde.fr", "spiegel.de",
}


def _shannon_entropy(counts: dict) -> float:
    total = sum(counts.values())
    if total == 0:
        return 0.0
    entropy = 0.0
    for count in counts.values():
        if count > 0:
            p = count / total
            entropy -= p * math.log2(p)
    # Normalize by max possible entropy (log2(n_categories))
    max_entropy = math.log2(len(counts)) if len(counts) > 1 else 1.0
    return entropy / max_entropy if max_entropy > 0 else 0.0


def analyze_bubble(domains: list[str]) -> dict:
    if not domains:
        return _empty_result()

    cleaned = [extract_domain(d) for d in domains]

    # Source diversity
    unique_domains = len(set(cleaned))
    source_diversity = min(unique_domains / max(len(cleaned), 1), 1.0)

    # Political diversity
    political_counts: dict = {
        "left": 0, "center": 0, "right": 0, "unknown": 0
    }
    for d in cleaned:
        lean = get_domain_political_lean(d)
        if "left" in lean:
            political_counts["left"] += 1
        elif "right" in lean:
            political_counts["right"] += 1
        elif lean == "center":
            political_counts["center"] += 1
        else:
            political_counts["unknown"] += 1
    political_diversity = _shannon_entropy(
        {k: v for k, v in political_counts.items() if k != "unknown"}
    )

    # Topic diversity
    topic_counts: dict = {}
    for d in cleaned:
        cat = get_domain_topic_category(d)
        topic_counts[cat] = topic_counts.get(cat, 0) + 1
    topic_diversity = _shannon_entropy(topic_counts)

    # Geographic diversity
    intl_count = sum(1 for d in cleaned if d in KNOWN_INTERNATIONAL)
    geo_diversity = min(intl_count / max(len(cleaned), 1) * 3, 1.0)  # scale up

    # Composite bubble score (100 = maximally bubbled)
    bubble_score = 100 - int(
        source_diversity    * 25
        + political_diversity * 35
        + topic_diversity     * 25
        + geo_diversity       * 15
    )
    bubble_score = max(0, min(100, bubble_score))

    # Determine dominant narrative
    dominant_lean = max(political_counts, key=political_counts.get)
    dominant_topic = max(topic_counts, key=topic_counts.get) if topic_counts else "general"
    dominant_narrative = f"{dominant_lean}-{dominant_topic}-{'intl' if intl_count > 2 else 'domestic'}"

    # Missing perspectives
    missing: list[str] = []
    if political_counts.get("left", 0) == 0:
        missing.append("left-leaning sources")
    if political_counts.get("right", 0) == 0:
        missing.append("right-leaning sources")
    if political_counts.get("center", 0) == 0:
        missing.append("centrist sources")
    if intl_count == 0:
        missing.append("international perspectives")
    if topic_counts.get("science", 0) == 0:
        missing.append("science/research sources")

    recommendation = (
        f"Your reading is {_bubble_label(bubble_score)}. "
        + (f"You're missing: {', '.join(missing[:3])}." if missing else "Good diversity detected.")
    )

    return {
        "bubble_score": bubble_score,
        "dominant_narrative": dominant_narrative,
        "missing_perspectives": missing,
        "source_diversity": round(source_diversity, 3),
        "political_diversity": round(political_diversity, 3),
        "topic_diversity": round(topic_diversity, 3),
        "geo_diversity": round(geo_diversity, 3),
        "recommendation": recommendation,
    }


def _bubble_label(score: int) -> str:
    if score >= 80:
        return "in a strong echo chamber"
    if score >= 60:
        return "in a moderate filter bubble"
    if score >= 40:
        return "somewhat diverse but with gaps"
    return "well diversified"


def _empty_result() -> dict:
    return {
        "bubble_score": 50,
        "dominant_narrative": "unknown",
        "missing_perspectives": [],
        "source_diversity": 0.5,
        "political_diversity": 0.5,
        "topic_diversity": 0.5,
        "geo_diversity": 0.0,
        "recommendation": "Not enough browsing data to analyze.",
    }
