import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

_configured = False


def _configure():
    global _configured
    if not _configured:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            genai.configure(api_key=api_key)
            _configured = True


async def generate_reality_explanation(scores: dict, reality_score: int) -> str:
    """Generate a 2-sentence plain-English explanation of the reality score."""
    _configure()
    if not _configured:
        return _fallback_explanation(scores, reality_score)

    prompt = (
        f"Given this content analysis:\n"
        f"- Reality Purity Score: {reality_score}/100\n"
        f"- AI-Generated Probability: {scores.get('ai_probability', 0):.0%}\n"
        f"- Manipulation Level: {scores.get('manipulation_score', 0)}/100\n"
        f"- Source Credibility: {scores.get('source_credibility', 50)}/100\n"
        f"- Fake News Detection: {scores.get('fake_news_label', 'UNKNOWN')}\n"
        f"- Flagged phrases: {scores.get('flagged_phrases', [])}\n\n"
        f"Explain in exactly 2 sentences why this content scored {reality_score}/100 "
        f"for reality purity. Be specific about which signals triggered concern. "
        f"Keep it factual, not political. Do not use bullet points."
    )

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return _fallback_explanation(scores, reality_score)


def _fallback_explanation(scores: dict, reality_score: int) -> str:
    ai_prob = scores.get("ai_probability", 0)
    manip = scores.get("manipulation_score", 0)
    cred = scores.get("source_credibility", 50)

    reasons = []
    if ai_prob > 0.6:
        reasons.append(f"high AI-generation probability ({ai_prob:.0%})")
    if manip > 60:
        reasons.append(f"elevated emotional manipulation signals ({manip}/100)")
    if cred < 40:
        reasons.append(f"low source credibility rating ({cred}/100)")
    if scores.get("fake_news_label") == "FAKE":
        reasons.append("fake news detection flag")

    if not reasons:
        return (
            f"This content scored {reality_score}/100 on the Reality Purity Index. "
            "No major red flags were detected in this scan."
        )

    reason_str = ", ".join(reasons)
    return (
        f"This content scored {reality_score}/100 due to {reason_str}. "
        "Treat this score as an informational signal — always apply your own critical judgment."
    )
