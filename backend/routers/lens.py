from fastapi import APIRouter, HTTPException
from models.schemas import (
    BubbleAuditRequest, BubbleAuditResponse,
    OpportunityRequest, OpportunityResponse, OpportunityItem,
    ProfileRequest, ProfileResponse,
)
from models.database import save_bubble_audit, save_opportunity_gap
from engines.lens_engine import run_bubble_audit, run_opportunity_audit, run_profile_inference

router = APIRouter()


@router.post("/bubble-audit", response_model=BubbleAuditResponse)
async def bubble_audit(req: BubbleAuditRequest):
    """Analyze browsing history domains for filter bubble characteristics."""
    if not req.domains:
        raise HTTPException(status_code=400, detail="No domains provided.")

    try:
        result = await run_bubble_audit(req)
    except Exception as exc:
        print(f"[LENS] bubble_audit failed: {exc}")
        result = BubbleAuditResponse(
            bubble_score=50,
            dominant_narrative="unknown",
            missing_perspectives=[],
            source_diversity=0.5,
            political_diversity=0.5,
            topic_diversity=0.5,
            geo_diversity=0.0,
            recommendation="Could not fully analyze browsing pattern. Try again shortly.",
        )

    try:
        await save_bubble_audit({
            "bubble_score": result.bubble_score,
            "dominant_category": result.dominant_narrative,
            "missing_perspectives": result.missing_perspectives,
            "anonymous_session_id": req.session_id or None,
        })
    except Exception:
        pass

    return result


@router.post("/opportunity-gap", response_model=OpportunityResponse)
async def opportunity_gap(req: OpportunityRequest):
    """Find the gap between available opportunities and algorithmically visible ones."""
    if not req.skills:
        raise HTTPException(status_code=400, detail="No skills provided.")

    try:
        result = await run_opportunity_audit(req)
    except Exception as exc:
        print(f"[LENS] opportunity_gap failed: {exc}")
        result = OpportunityResponse(
            total_found=0,
            estimated_shown=0,
            gap_size=0,
            opportunities=[],
            gap_explanation="Could not fetch opportunities. Check Adzuna API credentials.",
        )

    try:
        await save_opportunity_gap({
            "skills_category": ", ".join(req.skills[:3]),
            "opportunities_found": result.total_found,
            "opportunities_shown_estimate": result.estimated_shown,
            "gap_size": result.gap_size,
            "country_code": req.country_code,
        })
    except Exception:
        pass

    return result


@router.post("/profile", response_model=ProfileResponse)
async def algorithmic_profile(req: ProfileRequest):
    """Infer what advertising/recommendation systems likely classify this user as."""
    if not req.domains:
        raise HTTPException(status_code=400, detail="No domains provided.")

    try:
        return await run_profile_inference(req)
    except Exception as exc:
        print(f"[LENS] profile failed: {exc}")
        return ProfileResponse(
            likely_profile="Could not determine profile — AI model unavailable.",
            opportunity_blind_spots=[],
            filter_bubble_type="Unknown",
            recommendations=["Try again in a few moments."],
        )


@router.get("/demo")
async def demo_lens():
    """Demo endpoint for UI development."""
    return {
        "bubble": {
            "bubble_score": 78,
            "dominant_narrative": "right-news-domestic",
            "missing_perspectives": ["left-leaning sources", "international perspectives", "science/research sources"],
            "source_diversity": 0.25,
            "political_diversity": 0.18,
            "topic_diversity": 0.31,
            "geo_diversity": 0.05,
            "recommendation": "Your reading is in a strong echo chamber. You're missing: left-leaning sources, international perspectives, science/research sources.",
        },
        "opportunity": {
            "total_found": 347,
            "estimated_shown": 17,
            "gap_size": 330,
            "gap_explanation": "Based on 347 opportunities matching your skills, approximately 5% are surfaced by typical algorithmic feeds.",
        },
        "profile": {
            "likely_profile": "Conservative-leaning US news consumer, 30-45 age demographic, suburban professional",
            "opportunity_blind_spots": [
                "Remote-first international companies",
                "Non-US job markets",
                "Academic and research positions",
                "Public sector opportunities",
            ],
            "filter_bubble_type": "Political echo chamber with geographic insularity",
            "recommendations": [
                "Follow BBC, Reuters, or Al Jazeera for international perspectives",
                "Search LinkedIn without saved preferences to see unfiltered results",
                "Explore RemoteOK and Adzuna directly rather than via job feed",
            ],
        },
    }
