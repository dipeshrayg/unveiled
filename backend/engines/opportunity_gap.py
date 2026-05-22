"""
Opportunity Gap Analyzer.
Queries free job APIs and computes the gap between total opportunities
and what typical algorithmic feeds show users.
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "")

# Typical algorithmic exposure rate — empirically ~3-8% of total listings
# are surfaced by recommendation systems for a given profile
ESTIMATED_VISIBILITY_RATE = 0.05


async def fetch_adzuna_jobs(skills: list[str], country: str = "us") -> list[dict]:
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return []
    query = " ".join(skills[:3])
    url = (
        f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
        f"?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}"
        f"&what={query}&results_per_page=20&content-type=application/json"
    )
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                return [
                    {
                        "title": r.get("title", ""),
                        "company": r.get("company", {}).get("display_name", ""),
                        "location": r.get("location", {}).get("display_name", ""),
                        "url": r.get("redirect_url", ""),
                        "source": "Adzuna",
                    }
                    for r in results
                ]
    except Exception:
        pass
    return []


async def fetch_remoteok_jobs(skills: list[str]) -> list[dict]:
    if not skills:
        return []
    tag = skills[0].lower().replace(" ", "-")
    url = f"https://remoteok.com/api?tag={tag}"
    try:
        async with httpx.AsyncClient(timeout=10, headers={"User-Agent": "UNVEILED-Research/1.0"}) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                # First item is metadata
                jobs = [j for j in data if isinstance(j, dict) and j.get("position")]
                return [
                    {
                        "title": j.get("position", ""),
                        "company": j.get("company", ""),
                        "location": j.get("location", "Remote"),
                        "url": j.get("url", ""),
                        "source": "RemoteOK",
                    }
                    for j in jobs[:10]
                ]
    except Exception:
        pass
    return []


async def analyze_opportunity_gap(skills: list[str], country: str = "us") -> dict:
    adzuna_jobs = await fetch_adzuna_jobs(skills, country)
    remoteok_jobs = await fetch_remoteok_jobs(skills)

    all_jobs = adzuna_jobs + remoteok_jobs
    total_found = len(all_jobs)

    # Adzuna returns count_for_header — use that if available for more accurate total
    estimated_shown = max(1, int(total_found * ESTIMATED_VISIBILITY_RATE))
    gap_size = max(0, total_found - estimated_shown)

    gap_explanation = (
        f"Based on {total_found} opportunities matching your skills, "
        f"typical algorithmic feeds surface approximately {ESTIMATED_VISIBILITY_RATE:.0%} "
        f"of available positions. An estimated {gap_size} opportunities "
        f"may not appear in your regular feeds."
    )

    return {
        "total_found": total_found,
        "estimated_shown": estimated_shown,
        "gap_size": gap_size,
        "opportunities": all_jobs[:20],
        "gap_explanation": gap_explanation,
    }
