from fastapi import APIRouter, HTTPException
from models.schemas import ScanRequest, ScanResponse
from models.database import save_scan, get_aggregate_stats
from engines.signal_engine import analyze_content

router = APIRouter()


@router.post("/scan", response_model=ScanResponse)
async def scan_content(req: ScanRequest):
    """
    Analyze a webpage for reality purity.
    Returns a Reality Purity Score (0-100) with sub-scores and explanation.
    """
    if not req.text and not req.title:
        raise HTTPException(status_code=400, detail="No content provided for analysis.")

    result = await analyze_content(req)

    await save_scan({
        "url_domain": req.domain,
        "reality_score": result.reality_score,
        "ai_probability": result.sub_scores.ai_probability,
        "manipulation_score": result.sub_scores.manipulation_score,
        "source_credibility": result.sub_scores.source_credibility,
        "country_code": req.country_code,
        "anonymous_session_id": req.session_id,
    })

    return result


@router.get("/stats")
async def get_stats():
    """Aggregate statistics for research panel."""
    return await get_aggregate_stats()


@router.get("/demo")
async def demo_scan():
    """Demo endpoint — returns a mock scan for UI development."""
    return {
        "reality_score": 34,
        "color": "RED",
        "label": "Severely Polluted",
        "sub_scores": {
            "ai_probability": 0.82,
            "manipulation_score": 71,
            "source_credibility": 25,
            "fake_news_label": "FAKE",
            "fake_news_confidence": 0.76,
        },
        "explanation": (
            "This content scored 34/100 due to high AI-generation probability (82%), "
            "elevated manipulation signals, and low source credibility. "
            "Flagged phrases include 'SHOCKING' and 'they don't want you to know'."
        ),
        "domain": "example-low-credibility.com",
        "source_bias": "far-right",
        "source_factual": "low",
        "flagged_phrases": ["SHOCKING", "they don't want you to know", "BREAKING"],
    }
