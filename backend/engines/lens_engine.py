"""
LENS Engine — Algorithmic Opportunity Auditor
Orchestrates filter bubble detection, opportunity gap analysis,
and algorithmic profile inference.
"""

from engines.bubble_detector import analyze_bubble
from engines.opportunity_gap import analyze_opportunity_gap
from utils.groq_client import infer_algorithmic_profile
from models.schemas import (
    BubbleAuditRequest, BubbleAuditResponse,
    OpportunityRequest, OpportunityResponse, OpportunityItem,
    ProfileRequest, ProfileResponse,
)


async def run_bubble_audit(req: BubbleAuditRequest) -> BubbleAuditResponse:
    result = analyze_bubble(req.domains)
    return BubbleAuditResponse(**result)


async def run_opportunity_audit(req: OpportunityRequest) -> OpportunityResponse:
    result = await analyze_opportunity_gap(req.skills, req.country_code)
    opportunities = [OpportunityItem(**j) for j in result["opportunities"]]
    return OpportunityResponse(
        total_found=result["total_found"],
        estimated_shown=result["estimated_shown"],
        gap_size=result["gap_size"],
        opportunities=opportunities,
        gap_explanation=result["gap_explanation"],
    )


async def run_profile_inference(req: ProfileRequest) -> ProfileResponse:
    result = await infer_algorithmic_profile(req.domains, req.time_patterns or {})
    return ProfileResponse(
        likely_profile=result.get("likely_profile", "Unknown"),
        opportunity_blind_spots=result.get("opportunity_blind_spots", []),
        filter_bubble_type=result.get("filter_bubble_type", "Unknown"),
        recommendations=result.get("recommendations", []),
    )
