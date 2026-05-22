"""
Emotional manipulation + content quality detector.
Fully local — no external API needed. Produces varied scores based on
actual content signals, not fallback defaults.
"""

import re
import math

# ── Manipulation phrase patterns (weighted) ──────────────────────────────────
PATTERNS = [
    # High weight — strong manipulation signals
    (r"\bBREAKING\b",                              8),
    (r"\bSHOCKING\b",                              8),
    (r"\bEXCLUSIVE\b",                             5),
    (r"they don'?t want you to know",              12),
    (r"mainstream media won'?t tell",              12),
    (r"EXPOSED",                                   8),
    (r"cover.?up",                                 10),
    (r"deep state",                                10),
    (r"new world order",                           10),
    (r"wake up.{0,10}sheep",                       12),
    (r"you won'?t believe",                        7),
    (r"doctors hate",                              8),
    (r"this one.{0,10}trick",                      7),
    (r"is (?:killing|destroying) (?:you|us|america|the world)", 10),
    (r"THEY'?RE HIDING",                           10),
    # Medium weight
    (r"\bURGENT\b",                                5),
    (r"\bALERT\b",                                 4),
    (r"\bWARNING\b",                               3),
    (r"\bDEADLY\b",                                5),
    (r"\bCRISIS\b",                                4),
    (r"\bDISASTER\b",                              4),
    (r"\bOUTRAGEOUS\b",                            6),
    (r"\bDISGUSTING\b",                            5),
    (r"what happened next",                        4),
    (r"the truth (?:they|about)",                  6),
    (r"share before (?:it'?s|this is) deleted",    9),
    (r"must.{0,5}(?:read|watch|see)",              4),
    (r"(?:100|99)\s*%\s*(?:proven|confirmed|guaranteed)", 7),
    # Low weight — mild signals
    (r"\bEVIL\b",                                  3),
    (r"\bDESTROY\b",                               2),
    (r"fake (?:news|media)",                       4),
    (r"lamestream",                                5),
    (r"\bhoax\b",                                  5),
    (r"plandemic",                                 8),
]

COMPILED = [(re.compile(p, re.IGNORECASE), w) for p, w in PATTERNS]


def _caps_ratio(text: str) -> float:
    """Fraction of alphabetic characters that are uppercase."""
    alpha = [c for c in text if c.isalpha()]
    if not alpha:
        return 0.0
    return sum(1 for c in alpha if c.isupper()) / len(alpha)


def _exclamation_density(text: str) -> float:
    """Exclamation marks per 100 words."""
    words = text.split()
    if not words:
        return 0.0
    return (text.count("!") / len(words)) * 100


def _all_caps_word_ratio(text: str) -> float:
    """Fraction of words that are fully uppercase (3+ chars)."""
    words = text.split()
    if not words:
        return 0.0
    caps_words = [w for w in words if len(w) >= 3 and w.isupper() and w.isalpha()]
    return len(caps_words) / len(words)


def _question_lead_density(text: str) -> float:
    """Leading/rhetorical questions per 100 words."""
    words = text.split()
    if not words:
        return 0.0
    q_marks = text.count("?")
    return (q_marks / len(words)) * 100


def _repetition_score(text: str) -> float:
    """Detects word repetition as a manipulation signal (0-1)."""
    words = [w.lower() for w in text.split() if len(w) > 4]
    if len(words) < 20:
        return 0.0
    unique_ratio = len(set(words)) / len(words)
    # Low unique ratio = high repetition
    return max(0.0, 0.5 - unique_ratio)


def calculate_manipulation_score(text: str, sentiment: dict) -> tuple[int, list[str]]:
    """
    Returns (manipulation_score 0-100, list of flagged phrases).

    Components:
    - Pattern matching: up to 40 pts
    - ALL CAPS word ratio: up to 15 pts
    - Exclamation density: up to 10 pts
    - Sentiment extremity: up to 20 pts
    - Negativity: up to 10 pts
    - Repetition: up to 5 pts
    """
    # 1. Pattern matching
    flagged = []
    pattern_total = 0
    for compiled, weight in COMPILED:
        match = compiled.search(text)
        if match:
            flagged.append(match.group(0))
            pattern_total += weight
    pattern_score = min(40, pattern_total)

    # 2. ALL CAPS words
    caps_score = min(15, int(_all_caps_word_ratio(text) * 150))

    # 3. Exclamation density
    excl_score = min(10, int(_exclamation_density(text) * 5))

    # 4. Sentiment extremity (polarised = manipulative)
    neg = sentiment.get("negative", 0.33)
    neu = sentiment.get("neutral", 0.34)
    pos = sentiment.get("positive", 0.33)
    polarity = 1.0 - neu  # 0 = purely neutral, 1 = extremely polarised
    sentiment_score = int(polarity * 20)

    # 5. Negativity
    negativity_score = int(neg * 10)

    # 6. Repetition
    rep_score = int(_repetition_score(text) * 5)

    total = pattern_score + caps_score + excl_score + sentiment_score + negativity_score + rep_score
    return min(100, total), list(set(flagged))
