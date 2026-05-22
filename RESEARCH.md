# UNVEILED — Research Documentation

## Academic Framing

### Title
**UNVEILED: A Dual-Engine AI System for Real-Time Detection of Reality Pollution and Algorithmic Opportunity Suppression**

### Abstract
We present UNVEILED, an open-source browser extension and web dashboard that simultaneously addresses two previously unnamed civilizational-scale problems: (1) **Reality Pollution** — the systematic contamination of shared informational environments through AI-generated content, deepfakes, and algorithmic filter bubbles, and (2) the **Invisible Caste System** — the silent algorithmic sorting of individuals into opportunity tiers without transparency or recourse. Using an ensemble of open-source language models, retrieval-augmented analysis, and opportunity-gap detection via public employment APIs, UNVEILED provides real-time Reality Purity Scores and Algorithmic Opportunity Audits at zero cost to users. All code, data, and models are open source.

---

## Problem Statements

### Problem 3: Reality Pollution

**Definition:** Reality Pollution refers to the progressive degradation of the shared informational commons through the systematic introduction of synthetic, manipulated, or algorithmically-amplified false content, rendering collective truth-seeking unreliable at civilizational scale.

**Components:**
1. **AI-Generated Content Flooding** — Large language models can produce plausible-sounding false information at scale, indistinguishable to most readers.
2. **Synthetic Media (Deepfakes)** — Audio and video manipulation undermines the evidentiary value of media.
3. **Algorithmic Amplification** — Recommendation systems preferentially surface emotionally engaging (often false or misleading) content.
4. **Filter Bubble Epistemic Isolation** — Personalization algorithms create echo chambers that prevent exposure to corrective information.
5. **Manufactured Consensus** — Coordinated inauthentic behavior creates false impressions of widespread agreement.

**Why it is civilizational:** Democratic governance, scientific consensus formation, economic coordination, and social trust all depend on a shared informational commons. When that commons is systematically polluted, these systems fail.

### Problem 5: The Invisible Caste System

**Definition:** The Invisible Caste System refers to the algorithmic stratification of human populations into invisible opportunity tiers, where automated systems determine — without transparency, accountability, or recourse — which individuals are shown which jobs, educational opportunities, news, financial products, and social connections.

**Components:**
1. **Opportunity Filtering** — Job platforms, educational recommendation systems, and financial services use behavioral profiles to limit which options individuals see.
2. **Information Asymmetry** — Users cannot see the full opportunity space — only the filtered slice their profile permits.
3. **Self-Reinforcing Stratification** — Profiles built from past behavior limit future options, creating path-dependent poverty traps.
4. **Zero Transparency** — Unlike legal caste systems, algorithmic sorting has no formal structure, no public record, and no established right of appeal.
5. **Invisible Enforcement** — Affected individuals cannot identify when or why they are being sorted, making resistance impossible.

**Why it is civilizational:** If opportunity access is algorithmically constrained along existing socioeconomic lines, social mobility becomes structurally impossible without technical countermeasures.

---

## Methodology

### SIGNAL Engine — Reality Purity Scoring

#### Input
- Page text (full body content)
- Page URL and domain
- Page title and meta description
- Author information

#### Processing Pipeline

**Stage 1: AI Text Detection**
- Model: `Hello-SimpleAI/chatgpt-detector-roberta` (HuggingFace)
- Architecture: RoBERTa fine-tuned on human vs. AI-generated text pairs
- Output: P(AI-generated) ∈ [0, 1]

**Stage 2: Fake News Detection**
- Model: `hamzab/cnn-fake-news-detection` (HuggingFace)
- Architecture: CNN-based classifier trained on labeled news datasets
- Input: Article title + first 500 characters
- Output: {label: FAKE|REAL, confidence: [0,1]}

**Stage 3: Emotional Manipulation Scoring**
- Base model: `cardiffnlp/twitter-roberta-base-sentiment`
- Custom logic: Sentiment polarity + keyword pattern matching
- Flagged patterns: fear language, urgency markers, epistemic closure phrases
- Output: manipulation_score ∈ [0, 100]

**Stage 4: Source Credibility**
- Local JSON database of domain credibility ratings
- Sourced from: Media Bias/Fact Check public data
- Schema: `{domain: {bias, factual_reporting, credibility_score}}`
- Fallback: neutral score (50) with "unverified" flag

**Stage 5: Composite Score**

```
reality_score = (
    (1 - ai_probability)     * 0.30 +
    (factual_reliability/100) * 0.25 +
    (1 - manipulation/100)    * 0.25 +
    (source_credibility/100)  * 0.20
) * 100
```

**Stage 6: Natural Language Explanation**
- Model: Google Gemini Flash (gemini-1.5-flash)
- Generates 2-sentence human-readable explanation of score
- Grounded in specific signals that triggered concern

### LENS Engine — Opportunity Auditing

#### Filter Bubble Detection

**Input:** Last 20 visited domains (anonymized — no full URLs)

**Diversity Metrics:**
- Source diversity: unique domain count / 20
- Political diversity: Shannon entropy across {left, center, right} labels
- Topic diversity: Shannon entropy across {news, tech, science, culture, sports, etc.}
- Geographic diversity: {local, national, international} balance

**Composite Bubble Score:**
```
bubble_score = 100 - (
    source_diversity    * 25 +
    political_diversity * 35 +
    topic_diversity     * 25 +
    geo_diversity       * 15
)
```

#### Opportunity Gap Analysis

**Method:**
1. User defines skills/interests (one-time, stored locally)
2. Query Adzuna API + RemoteOK for matching opportunities
3. Estimate algorithmic visibility using average CTR models from literature
4. Gap = Total opportunities - Estimated shown opportunities

**Algorithmic Profile Inference:**
- Model: Llama 3.1 70B via Groq (free tier)
- Input: anonymized domain visit patterns
- Output: inferred advertiser profile category + blind spots

---

## Validation

### Limitations
1. AI detection models have known false positive rates, particularly for academic writing
2. Source credibility database is static and may lag current events
3. Opportunity gap estimation is probabilistic, not exact
4. Algorithmic profile inference is inferential, not verified by platform operators
5. Filter bubble scores are computed on limited recent history

### Ethical Considerations
- No personal data collected or stored
- All analysis is local or anonymized before transmission
- Scores are informational, not definitive verdicts
- Users are encouraged to critically evaluate all scores

---

## Research Questions

1. What is the average Reality Purity Score of content consumed by users across different platform types (news, social media, blogs)?
2. Is there a correlation between filter bubble score and reality score of consumed content?
3. Does algorithmic profile type predict the size of the opportunity gap experienced?
4. Can real-time scoring feedback change user content selection behavior over time?
5. Which domains consistently score below 60 on the Reality Purity Index?

---

## Citation

```bibtex
@software{unveiled2026,
  title     = {UNVEILED: A Dual-Engine AI System for Real-Time Detection of 
               Reality Pollution and Algorithmic Opportunity Suppression},
  author    = {[Author Name]},
  year      = {2026},
  url       = {https://github.com/dipeshrayg/unveiled},
  license   = {MIT},
  note      = {Presented at [Technology Fair Name]}
}
```

---

## Publication Targets

- **arXiv:** cs.AI / cs.CY (Computers and Society) — free preprint submission
- **Zenodo:** Free DOI assignment for research artifacts
- **GitHub:** Permanent open-source home

---

## Acknowledgments

This research uses the following freely available resources:
- HuggingFace Inference API
- Google Gemini Flash API
- Groq Llama 3.1 70B
- Adzuna Jobs API
- Supabase
- Media Bias/Fact Check public domain data
