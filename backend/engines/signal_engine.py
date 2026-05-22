"""
SIGNAL Engine — Reality Purity Scoring
Orchestrates all sub-detectors and computes the composite Reality Purity Score.
"""

from engines.ai_detector import run_ai_detection
from engines.manipulation_score import calculate_manipulation_score
from engines.source_credibility import get_credibility
from utils.huggingface_client import get_sentiment
from utils.gemini_client import generate_reality_explanation
from models.schemas import ScanRequest, ScanResponse, SubScores


def _compute_reality_score(
    ai_probability: float,
    factual_reliability: int,
    manipulation_score: int,
    source_credibility: int,
) -> int:
    score = (
        (1 - ai_probability) * 0.30
        + (factual_reliability / 100) * 0.25
        + (1 - manipulation_score / 100) * 0.25
        + (source_credibility / 100) * 0.20
    ) * 100
    return max(0, min(100, round(score)))


def _score_to_color(score: int) -> tuple[str, str]:
    if score >= 80:
        return "GREEN", "Clean Signal"
    if score >= 60:
        return "YELLOW", "Moderate Pollution"
    if score >= 40:
        return "ORANGE", "High Pollution"
    return "RED", "Severely Polluted"


async def analyze_content(req: ScanRequest) -> ScanResponse:
    text = req.text or ""
    title = req.title or ""

    # Parallel detection (sequential here for clarity — all I/O bound)
    ai_result = await run_ai_detection(text, title)
    sentiment = await get_sentiment(text)

    manipulation_score, flagged_phrases = calculate_manipulation_score(text, sentiment)
    credibility_data = get_credibility(req.domain)

    ai_probability = ai_result["ai_probability"]
    fake_label = ai_result["fake_news_label"]
    fake_confidence = ai_result["fake_news_confidence"]
    source_credibility = credibility_data["score"]

    # Fake news label adjusts factual_reliability
    if fake_label == "FAKE":
        factual_reliability = max(0, source_credibility - int(fake_confidence * 30))
    else:
        factual_reliability = source_credibility

    reality_score = _compute_reality_score(
        ai_probability, factual_reliability, manipulation_score, source_credibility
    )
    color, label = _score_to_color(reality_score)

    scores_for_explanation = {
        "ai_probability": ai_probability,
        "manipulation_score": manipulation_score,
        "source_credibility": source_credibility,
        "fake_news_label": fake_label,
        "flagged_phrases": flagged_phrases,
    }
    explanation = await generate_reality_explanation(scores_for_explanation, reality_score)

    return ScanResponse(
        reality_score=reality_score,
        color=color,
        label=label,
        sub_scores=SubScores(
            ai_probability=ai_probability,
            manipulation_score=manipulation_score,
            source_credibility=source_credibility,
            fake_news_label=fake_label,
            fake_news_confidence=fake_confidence,
        ),
        explanation=explanation,
        domain=req.domain,
        source_bias=credibility_data.get("bias", "unknown"),
        source_factual=credibility_data.get("factual", "unverified"),
        flagged_phrases=flagged_phrases,
    )
