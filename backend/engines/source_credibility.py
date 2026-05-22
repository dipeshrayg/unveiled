"""
Source credibility database and scorer.
Domain ratings derived from publicly available Media Bias/Fact Check data.
"""

import tldextract
from typing import Optional

# Credibility database: domain -> {bias, factual, score}
# Score: 0-100 (100 = most credible)
CREDIBILITY_DB: dict[str, dict] = {
    # High credibility — major established outlets
    "reuters.com":       {"bias": "center",       "factual": "high",   "score": 92},
    "apnews.com":        {"bias": "center",       "factual": "high",   "score": 91},
    "bbc.com":           {"bias": "center-left",  "factual": "high",   "score": 88},
    "bbc.co.uk":         {"bias": "center-left",  "factual": "high",   "score": 88},
    "npr.org":           {"bias": "center-left",  "factual": "high",   "score": 87},
    "economist.com":     {"bias": "center",       "factual": "high",   "score": 87},
    "theguardian.com":   {"bias": "left",         "factual": "high",   "score": 83},
    "nytimes.com":       {"bias": "center-left",  "factual": "high",   "score": 82},
    "wsj.com":           {"bias": "center-right", "factual": "high",   "score": 82},
    "washingtonpost.com":{"bias": "center-left",  "factual": "high",   "score": 81},
    "ft.com":            {"bias": "center",       "factual": "high",   "score": 85},
    "pbs.org":           {"bias": "center-left",  "factual": "high",   "score": 88},
    "nature.com":        {"bias": "center",       "factual": "high",   "score": 96},
    "science.org":       {"bias": "center",       "factual": "high",   "score": 96},
    "scientificamerican.com": {"bias": "center",  "factual": "high",   "score": 92},
    "snopes.com":        {"bias": "center-left",  "factual": "high",   "score": 90},
    "factcheck.org":     {"bias": "center",       "factual": "high",   "score": 92},
    "politifact.com":    {"bias": "center-left",  "factual": "high",   "score": 89},
    # Mixed credibility
    "cnn.com":           {"bias": "left",         "factual": "mixed",  "score": 65},
    "foxnews.com":       {"bias": "right",        "factual": "mixed",  "score": 55},
    "msnbc.com":         {"bias": "left",         "factual": "mixed",  "score": 60},
    "nypost.com":        {"bias": "right",        "factual": "mixed",  "score": 55},
    "dailymail.co.uk":   {"bias": "right",        "factual": "mixed",  "score": 45},
    "breitbart.com":     {"bias": "far-right",    "factual": "low",    "score": 25},
    "dailywire.com":     {"bias": "right",        "factual": "mixed",  "score": 45},
    "huffpost.com":      {"bias": "left",         "factual": "mixed",  "score": 58},
    "vox.com":           {"bias": "left",         "factual": "mixed",  "score": 62},
    "theintercept.com":  {"bias": "left",         "factual": "mixed",  "score": 60},
    "motherjones.com":   {"bias": "left",         "factual": "mixed",  "score": 62},
    "reason.com":        {"bias": "right",        "factual": "mixed",  "score": 65},
    # Low credibility
    "infowars.com":      {"bias": "conspiracy",   "factual": "low",    "score": 5},
    "naturalnews.com":   {"bias": "conspiracy",   "factual": "low",    "score": 8},
    "beforeitsnews.com": {"bias": "conspiracy",   "factual": "low",    "score": 5},
    "worldnewsdailyreport.com": {"bias": "satire","factual": "low",    "score": 10},
    "theonion.com":      {"bias": "satire",       "factual": "satire", "score": 50},
    # Social media (not news sources per se)
    "twitter.com":       {"bias": "mixed",        "factual": "mixed",  "score": 40},
    "x.com":             {"bias": "mixed",        "factual": "mixed",  "score": 40},
    "facebook.com":      {"bias": "mixed",        "factual": "mixed",  "score": 35},
    "reddit.com":        {"bias": "mixed",        "factual": "mixed",  "score": 45},
    "youtube.com":       {"bias": "mixed",        "factual": "mixed",  "score": 42},
}

UNVERIFIED = {"bias": "unknown", "factual": "unverified", "score": 50}


def extract_domain(url_or_domain: str) -> str:
    """Extract the registered domain from a full URL or raw domain string."""
    if "://" not in url_or_domain:
        url_or_domain = "https://" + url_or_domain
    ext = tldextract.extract(url_or_domain)
    return f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain


def get_credibility(url_or_domain: str) -> dict:
    domain = extract_domain(url_or_domain)
    result = CREDIBILITY_DB.get(domain, None)
    if result:
        return {**result, "domain": domain, "verified": True}
    # Try www. variant
    www_domain = f"www.{domain}"
    result = CREDIBILITY_DB.get(www_domain, None)
    if result:
        return {**result, "domain": domain, "verified": True}
    return {**UNVERIFIED, "domain": domain, "verified": False}


def get_domain_political_lean(domain: str) -> str:
    data = get_credibility(domain)
    return data.get("bias", "unknown")


def get_domain_topic_category(domain: str) -> str:
    """Rough topic categorization for bubble analysis."""
    domain_lower = domain.lower()
    if any(kw in domain_lower for kw in ["news", "times", "post", "tribune", "herald", "mail", "daily", "bbc", "cnn", "fox"]):
        return "news"
    if any(kw in domain_lower for kw in ["tech", "wired", "verge", "ars", "github", "stackoverflow", "hacker"]):
        return "tech"
    if any(kw in domain_lower for kw in ["science", "nature", "research", "academic", "scholar", "pubmed", "arxiv"]):
        return "science"
    if any(kw in domain_lower for kw in ["sport", "espn", "nba", "nfl", "fifa", "soccer", "cricket"]):
        return "sports"
    if any(kw in domain_lower for kw in ["health", "medical", "hospital", "wellness", "webmd", "mayo"]):
        return "health"
    if any(kw in domain_lower for kw in ["finance", "market", "invest", "stock", "crypto", "bloomberg"]):
        return "finance"
    if any(kw in domain_lower for kw in ["entertain", "movie", "music", "celebrity", "culture", "imdb", "spotify"]):
        return "entertainment"
    return "general"
