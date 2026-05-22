from fastapi import APIRouter, HTTPException
from models.schemas import ScanRequest, ScanResponse, SubScores
from models.database import save_scan, get_aggregate_stats
from engines.signal_engine import analyze_content

router = APIRouter()


@router.post("/scan", response_model=ScanResponse)
async def scan_content(req: ScanRequest):
    """
    Analyze a webpage for reality purity.
    Returns a Reality Purity Score (0-100) with sub-scores and explanation.
    Always returns a valid response — never a 500 error.
    """
    if not req.text and not req.title:
        raise HTTPException(status_code=400, detail="No content provided for analysis.")

    try:
        result = await analyze_content(req)
    except Exception as exc:
        # Graceful degradation — return a neutral score with explanation
        print(f"[SIGNAL] analyze_content failed: {exc}")
        result = ScanResponse(
            reality_score=50,
            color="YELLOW",
            label="Moderate Pollution",
            sub_scores=SubScores(
                ai_probability=0.5,
                manipulation_score=50,
                source_credibility=50,
                fake_news_label="UNKNOWN",
                fake_news_confidence=0.5,
            ),
            explanation=(
                "Analysis partially unavailable — AI models are warming up. "
                "Score defaults to 50/100. Refresh in 30 seconds for a full reading."
            ),
            domain=req.domain,
            source_bias="unknown",
            source_factual="unverified",
            flagged_phrases=[],
        )

    try:
        await save_scan({
            "url_domain": req.domain,
            "reality_score": result.reality_score,
            "ai_probability": result.sub_scores.ai_probability,
            "manipulation_score": result.sub_scores.manipulation_score,
            "source_credibility": result.sub_scores.source_credibility,
            "country_code": req.country_code,
            "anonymous_session_id": req.session_id or None,
        })
    except Exception:
        pass  # DB save failure never breaks the response

    return result


@router.get("/stats")
async def get_stats():
    """Aggregate statistics for research panel."""
    try:
        return await get_aggregate_stats()
    except Exception:
        return {"total_scans": 0, "average_reality_score": 0, "most_polluted_domains": []}


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
