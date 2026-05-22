from fastapi import APIRouter, HTTPException
from models.schemas import (
    BubbleAuditRequest, BubbleAuditResponse,
    OpportunityRequest, OpportunityResponse,
    ProfileRequest, ProfileResponse,
)
from models.database import save_bubble_audit, save_opportunity_gap
from engines.lens_engine import run_bubble_audit, run_opportunity_audit, run_profile_inference

router = APIRouter()


@router.post("/bubble-audit", response_model=BubbleAuditResponse)
async def bubble_audit(req: BubbleAuditRequest):
    """
    Analyze browsing history domains for filter bubble characteristics.
    Input: up to 20 recently visited domains (no full URLs — privacy protected).
    """
    if not req.domains:
        raise HTTPException(status_code=400, detail="No domains provided.")

    result = await run_bubble_audit(req)

    await save_bubble_audit({
        "bubble_score": result.bubble_score,
        "dominant_category": result.dominant_narrative,
        "missing_perspectives": result.missing_perspectives,
        "anonymous_session_id": req.session_id,
    })

    return result


@router.post("/opportunity-gap", response_model=OpportunityResponse)
async def opportunity_gap(req: OpportunityRequest):
    """
    Find the gap between available opportunities and algorithmically visible ones.
    Input: user skills/interests list.
    """
    if not req.skills:
        raise HTTPException(status_code=400, detail="No skills provided.")

    result = await run_opportunity_audit(req)

    await save_opportunity_gap({
        "skills_category": ", ".join(req.skills[:3]),
        "opportunities_found": result.total_found,
        "opportunities_shown_estimate": result.estimated_shown,
        "gap_size": result.gap_size,
        "country_code": req.country_code,
    })

    return result


@router.post("/profile", response_model=ProfileResponse)
async def algorithmic_profile(req: ProfileRequest):
    """
    Infer what advertising/recommendation systems likely classify this user as.
    Input: anonymized list of visited domains.
    """
    if not req.domains:
        raise HTTPException(status_code=400, detail="No domains provided.")

    return await run_profile_inference(req)


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
