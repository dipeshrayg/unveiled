"""
AI-generated content detection wrapper.
Primary: HuggingFace RoBERTa model
Fallback: Heuristic analysis
"""

from utils.huggingface_client import detect_ai_text, detect_fake_news


async def run_ai_detection(text: str, title: str) -> dict:
    """
    Returns:
      ai_probability: float [0,1]
      fake_news_label: str FAKE|REAL|UNKNOWN
      fake_news_confidence: float
    """
    ai_prob = await detect_ai_text(text)
    fake_result = await detect_fake_news(title, text)

    return {
        "ai_probability": ai_prob,
        "fake_news_label": fake_result["label"],
        "fake_news_confidence": fake_result["confidence"],
    }
