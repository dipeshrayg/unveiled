import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_db() -> Client | None:
    global _client
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_ANON_KEY", "")
    if not url or not key:
        return None
    if _client is None:
        _client = create_client(url, key)
    return _client


async def save_scan(data: dict) -> bool:
    db = get_db()
    if not db:
        return False
    try:
        db.table("scans").insert(data).execute()
        return True
    except Exception:
        return False


async def save_bubble_audit(data: dict) -> bool:
    db = get_db()
    if not db:
        return False
    try:
        db.table("bubble_audits").insert(data).execute()
        return True
    except Exception:
        return False


async def save_opportunity_gap(data: dict) -> bool:
    db = get_db()
    if not db:
        return False
    try:
        db.table("opportunity_gaps").insert(data).execute()
        return True
    except Exception:
        return False


async def get_aggregate_stats() -> dict:
    db = get_db()
    if not db:
        return _mock_stats()
    try:
        scans = db.table("scans").select("reality_score, url_domain").execute()
        rows = scans.data or []
        if not rows:
            return _mock_stats()
        avg_score = sum(r["reality_score"] for r in rows) / len(rows)
        domain_counts: dict = {}
        for r in rows:
            d = r["url_domain"]
            domain_counts[d] = domain_counts.get(d, {"count": 0, "total": 0})
            domain_counts[d]["count"] += 1
            domain_counts[d]["total"] += r["reality_score"]
        domain_avgs = [
            {"domain": d, "avg_score": v["total"] / v["count"], "scans": v["count"]}
            for d, v in domain_counts.items()
        ]
        domain_avgs.sort(key=lambda x: x["avg_score"])
        return {
            "total_scans": len(rows),
            "average_reality_score": round(avg_score, 1),
            "most_polluted_domains": domain_avgs[:10],
        }
    except Exception:
        return _mock_stats()


def _mock_stats() -> dict:
    return {
        "total_scans": 0,
        "average_reality_score": 0,
        "most_polluted_domains": [],
    }
