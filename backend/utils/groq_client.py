import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client: Groq | None = None


def get_client() -> Groq | None:
    global _client
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return None
    if _client is None:
        _client = Groq(api_key=api_key)
    return _client


async def infer_algorithmic_profile(domains: list[str], time_patterns: dict) -> dict:
    """Use Llama 3.1 70B to infer what ad/recommendation systems think of this user."""
    client = get_client()
    if not client:
        return _fallback_profile(domains)

    domain_sample = ", ".join(domains[:20])
    prompt = (
        f"Based on this anonymous browsing pattern:\n"
        f"Domains visited: {domain_sample}\n"
        f"Time patterns: {json.dumps(time_patterns)}\n\n"
        f"What algorithmic profile category would advertising and recommendation systems "
        f"likely assign this user? What opportunities might be systematically hidden from "
        f"someone with this profile? Respond ONLY with valid JSON in this exact format:\n"
        f'{{"likely_profile": "...", "opportunity_blind_spots": ["...", "..."], '
        f'"filter_bubble_type": "...", "recommendations": ["...", "...", "..."]}}'
    )

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.3,
        )
        text = completion.choices[0].message.content.strip()
        # Extract JSON from response
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
        return _fallback_profile(domains)
    except Exception:
        return _fallback_profile(domains)


def _fallback_profile(domains: list[str]) -> dict:
    return {
        "likely_profile": "General news consumer with moderate tech interest",
        "opportunity_blind_spots": [
            "International job markets",
            "Non-English research publications",
            "Alternative career pathways",
        ],
        "filter_bubble_type": "Mild echo chamber — primarily English-language, Western-centric sources",
        "recommendations": [
            "Add international news sources to your reading list",
            "Explore job boards outside your primary country",
            "Follow accounts from disciplines adjacent to your primary interests",
        ],
    }
