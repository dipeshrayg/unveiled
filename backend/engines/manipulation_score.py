"""
Emotional manipulation detector.
Combines sentiment polarity with keyword pattern matching.
"""

import re

# High-manipulation trigger phrases
MANIPULATION_PATTERNS = [
    # Urgency / fear
    r"\bBREAKING\b",
    r"\bURGENT\b",
    r"\bSHOCKING\b",
    r"\bEXCLUSIVE\b",
    r"\bALERT\b",
    r"\bWARNING\b",
    r"\bDEADLY\b",
    r"\bCRISIS\b",
    r"\bDISASTER\b",
    # Conspiracy / epistemic closure
    r"they don'?t want you to know",
    r"mainstream media won'?t tell you",
    r"the truth (?:they|about what)",
    r"wake up",
    r"sheeple",
    r"they'?re hiding",
    r"EXPOSED",
    r"cover.?up",
    r"deep state",
    r"new world order",
    # Outrage
    r"OUTRAGEOUS",
    r"DISGUSTING",
    r"SICK",
    r"EVIL",
    r"DESTROY",
    r"OBLITERATE",
    # Clickbait
    r"you won'?t believe",
    r"what happened next",
    r"this one (?:weird|simple) trick",
    r"doctors hate",
    r"is (?:killing|destroying) (?:you|us|america)",
]

COMPILED = [re.compile(p, re.IGNORECASE) for p in MANIPULATION_PATTERNS]


def count_manipulation_flags(text: str) -> list[str]:
    flagged = []
    for pattern in COMPILED:
        match = pattern.search(text)
        if match:
            flagged.append(match.group(0))
    return list(set(flagged))


def calculate_manipulation_score(text: str, sentiment: dict) -> tuple[int, list[str]]:
    """
    Returns (manipulation_score 0-100, list of flagged phrases).

    Components:
    - Keyword flags: up to 50 points (5 pts each, max 10 flags)
    - Sentiment polarity: up to 30 points (extreme negative/positive = high)
    - Sentiment negativity: up to 20 points
    """
    flagged = count_manipulation_flags(text)
    keyword_score = min(len(flagged) * 5, 50)

    neg = sentiment.get("negative", 0.33)
    pos = sentiment.get("positive", 0.33)
    neu = sentiment.get("neutral", 0.34)

    # Extreme polarity in either direction is manipulative
    polarity_extremity = 1.0 - neu  # high = very polarized
    polarity_score = int(polarity_extremity * 30)

    # Negativity specifically
    negativity_score = int(neg * 20)

    total = keyword_score + polarity_score + negativity_score
    return min(total, 100), flagged
