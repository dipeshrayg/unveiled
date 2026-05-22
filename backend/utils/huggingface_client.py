import os
import httpx
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_BASE = "https://api-inference.huggingface.co/models"


async def query_model(model: str, payload: dict):
    """Call a HuggingFace Inference API model. Returns parsed JSON or None on any error."""
    if not HF_TOKEN:
        return None
    url = f"{HF_BASE}/{model}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    try:
        async with httpx.AsyncClient(timeout=45) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                return resp.json()
            # 503 = model loading, anything else = error — both return None
            return None
    except Exception:
        return None


def _extract_scores(result) -> list:
    """Normalize HF response into a flat list of {label, score} dicts."""
    if not result:
        return []
    # Shape A: [[{label, score}, ...]]  (most classification models)
    if isinstance(result, list) and result and isinstance(result[0], list):
        return result[0]
    # Shape B: [{label, score}, ...]
    if isinstance(result, list) and result and isinstance(result[0], dict):
        return result
    return []


async def detect_ai_text(text: str) -> float:
    """Returns probability [0,1] that text is AI-generated. Falls back to 0.5."""
    try:
        result = await query_model(
            "Hello-SimpleAI/chatgpt-detector-roberta",
            {"inputs": text[:512]}
        )
        scores = _extract_scores(result)
        for item in scores:
            label = item.get("label", "").upper()
            if label in ("CHATGPT", "AI", "MACHINE", "LABEL_1"):
                return round(float(item["score"]), 4)
        # Return complement of human score if found
        for item in scores:
            label = item.get("label", "").upper()
            if label in ("HUMAN", "LABEL_0"):
                return round(1.0 - float(item["score"]), 4)
    except Exception:
        pass
    return 0.5


async def detect_fake_news(title: str, text: str) -> dict:
    """Returns {label: FAKE|REAL|UNKNOWN, confidence: float}."""
    try:
        input_text = f"{title}. {text[:500]}"
        result = await query_model(
            "hamzab/cnn-fake-news-detection",
            {"inputs": input_text}
        )
        scores = _extract_scores(result)
        if scores:
            best = max(scores, key=lambda x: float(x.get("score", 0)))
            label = best.get("label", "UNKNOWN").upper()
            if label not in ("FAKE", "REAL"):
                label = "FAKE" if "fake" in label.lower() else "REAL"
            return {"label": label, "confidence": round(float(best["score"]), 4)}
    except Exception:
        pass
    return {"label": "UNKNOWN", "confidence": 0.5}


async def get_sentiment(text: str) -> dict:
    """Returns {negative, neutral, positive} scores. Falls back to neutral."""
    try:
        result = await query_model(
            "cardiffnlp/twitter-roberta-base-sentiment",
            {"inputs": text[:512]}
        )
        scores = _extract_scores(result)
        out = {"negative": 0.33, "neutral": 0.34, "positive": 0.33}
        for item in scores:
            lbl = item.get("label", "").lower()
            val = float(item.get("score", 0))
            if "neg" in lbl or lbl == "label_0":
                out["negative"] = val
            elif "neu" in lbl or lbl == "label_1":
                out["neutral"] = val
            elif "pos" in lbl or lbl == "label_2":
                out["positive"] = val
        return out
    except Exception:
        pass
    return {"negative": 0.33, "neutral": 0.34, "positive": 0.33}
