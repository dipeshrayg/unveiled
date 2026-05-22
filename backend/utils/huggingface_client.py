import os
import httpx
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_BASE = "https://api-inference.huggingface.co/models"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}


async def query_model(model: str, payload: dict) -> dict | list | None:
    url = f"{HF_BASE}/{model}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=HEADERS, json=payload)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 503:
            # Model is loading — return None, caller handles fallback
            return None
        return None


async def detect_ai_text(text: str) -> float:
    """Returns probability [0,1] that text is AI-generated."""
    truncated = text[:512]
    result = await query_model(
        "Hello-SimpleAI/chatgpt-detector-roberta",
        {"inputs": truncated}
    )
    if not result or not isinstance(result, list):
        return 0.5  # neutral fallback
    # Result shape: [[{"label":"...", "score":...}, ...]]
    scores = result[0] if isinstance(result[0], list) else result
    for item in scores:
        if isinstance(item, dict) and item.get("label", "").upper() in ("CHATGPT", "AI", "MACHINE"):
            return round(item["score"], 4)
    # If no AI label found, return complement of human score
    for item in scores:
        if isinstance(item, dict) and item.get("label", "").upper() in ("HUMAN",):
            return round(1.0 - item["score"], 4)
    return 0.5


async def detect_fake_news(title: str, text: str) -> dict:
    """Returns {label: FAKE|REAL, confidence: float}."""
    input_text = f"{title}. {text[:500]}"
    result = await query_model(
        "hamzab/cnn-fake-news-detection",
        {"inputs": input_text}
    )
    if not result or not isinstance(result, list):
        return {"label": "UNKNOWN", "confidence": 0.5}
    scores = result[0] if isinstance(result[0], list) else result
    best = max(scores, key=lambda x: x.get("score", 0))
    label = best.get("label", "UNKNOWN").upper()
    if label not in ("FAKE", "REAL"):
        label = "REAL" if "real" in label.lower() else "FAKE"
    return {"label": label, "confidence": round(best["score"], 4)}


async def get_sentiment(text: str) -> dict:
    """Returns sentiment scores for manipulation detection."""
    truncated = text[:512]
    result = await query_model(
        "cardiffnlp/twitter-roberta-base-sentiment",
        {"inputs": truncated}
    )
    if not result or not isinstance(result, list):
        return {"negative": 0.33, "neutral": 0.34, "positive": 0.33}
    scores = result[0] if isinstance(result[0], list) else result
    out = {}
    for item in scores:
        lbl = item.get("label", "").lower()
        if "neg" in lbl:
            out["negative"] = item["score"]
        elif "neu" in lbl:
            out["neutral"] = item["score"]
        elif "pos" in lbl:
            out["positive"] = item["score"]
    return out
