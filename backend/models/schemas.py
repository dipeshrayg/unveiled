from pydantic import BaseModel, Field
from typing import Optional, List


# ── SIGNAL Engine Schemas ──────────────────────────────────────────────────

class ScanRequest(BaseModel):
    url: str
    domain: str
    title: str = ""
    text: str = ""
    meta_description: str = ""
    author: str = ""
    outbound_links: List[str] = []
    has_images: bool = False
    has_videos: bool = False
    session_id: str = ""
    country_code: str = "US"


class SubScores(BaseModel):
    ai_probability: float = Field(..., ge=0.0, le=1.0)
    manipulation_score: int = Field(..., ge=0, le=100)
    source_credibility: int = Field(..., ge=0, le=100)
    fake_news_label: str = "UNKNOWN"
    fake_news_confidence: float = 0.5


class ScanResponse(BaseModel):
    reality_score: int = Field(..., ge=0, le=100)
    color: str  # GREEN | YELLOW | ORANGE | RED
    label: str  # Clean Signal | Moderate Pollution | High Pollution | Severely Polluted
    sub_scores: SubScores
    explanation: str
    domain: str
    source_bias: str = "unknown"
    source_factual: str = "unknown"
    flagged_phrases: List[str] = []


# ── LENS Engine Schemas ────────────────────────────────────────────────────

class BubbleAuditRequest(BaseModel):
    domains: List[str] = Field(..., max_length=20)
    session_id: str = ""
    country_code: str = "US"


class BubbleAuditResponse(BaseModel):
    bubble_score: int = Field(..., ge=0, le=100)
    dominant_narrative: str
    missing_perspectives: List[str]
    source_diversity: float
    political_diversity: float
    topic_diversity: float
    geo_diversity: float
    recommendation: str


class OpportunityRequest(BaseModel):
    skills: List[str]
    country_code: str = "us"
    session_id: str = ""


class OpportunityItem(BaseModel):
    title: str
    company: str
    location: str
    url: str
    source: str


class OpportunityResponse(BaseModel):
    total_found: int
    estimated_shown: int
    gap_size: int
    opportunities: List[OpportunityItem]
    gap_explanation: str


class ProfileRequest(BaseModel):
    domains: List[str]
    time_patterns: Optional[dict] = {}
    session_id: str = ""


class ProfileResponse(BaseModel):
    likely_profile: str
    opportunity_blind_spots: List[str]
    filter_bubble_type: str
    recommendations: List[str]
