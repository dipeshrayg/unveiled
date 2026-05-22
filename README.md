# UNVEILED

> **U**niversal **N**avigator for **V**erified, **E**xposed, and **I**lluminated **L**ife **E**xistence **D**ata

**See what's real. See what's hidden.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cost](https://img.shields.io/badge/Cost-%240.00%2Fmonth-brightgreen)](README.md)
[![arXiv](https://img.shields.io/badge/arXiv-preprint-red)](README.md)

---

## The Two Problems Nobody Named

### Problem 3 — Reality Pollution
The shared informational environment that civilization depends on is being poisoned by AI-generated content, deepfakes, algorithmic filter bubbles, and manufactured consensus. Most people consume content without any signal of its integrity.

### Problem 5 — The Invisible Caste System
Algorithms are silently sorting humans into opportunity tiers — controlling which jobs, news, education, and information they see — with zero visibility or right of appeal. This is a caste system enforced not by law but by code.

---

## What UNVEILED Does

UNVEILED is a **dual-engine AI system** deployed as a browser extension + web dashboard that runs in real-time on every page you visit:

### SIGNAL Engine — Reality Purity Scorer
Every piece of content receives a **Reality Purity Score (0–100)** based on:
- AI-generated content probability (HuggingFace RoBERTa)
- Fake news / misinformation detection
- Emotional manipulation scoring
- Source credibility rating

**Score color map:**
| Score | Color | Meaning |
|-------|-------|---------|
| 80–100 | 🟢 GREEN | Clean Signal |
| 60–79 | 🟡 YELLOW | Moderate Pollution |
| 40–59 | 🟠 ORANGE | High Pollution |
| 0–39 | 🔴 RED | Severely Polluted |

### LENS Engine — Algorithmic Opportunity Auditor
Every browsing session is analyzed for:
- **Filter Bubble Score** — how trapped you are in an echo chamber
- **Algorithmic Profile** — what systems think you are (and what they hide)
- **Opportunity Gap** — jobs, content, and information hidden from your feed

---

## Live Demo

- **Frontend Dashboard:** https://dipeshrayg.github.io/unveiled
- **Backend API:** https://unveiled-api.onrender.com
- **Extension:** Install from `/extension` folder via Developer Mode

---

## Architecture

```
Browser Extension (Chrome/Firefox)
        │
        ▼
FastAPI Backend (Render.com — free)
        │
   ┌────┴────┐
   ▼         ▼
SIGNAL     LENS
Engine     Engine
   │         │
   ├─ HuggingFace (AI detection)
   ├─ Gemini Flash (explanations)
   ├─ Groq/Llama (profile analysis)
   └─ Supabase (anonymous data)
        │
        ▼
React Dashboard (GitHub Pages — free)
```

---

## Zero Cost Stack

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| GitHub | Hosting + CI/CD | Forever free |
| GitHub Pages | Frontend | Forever free |
| Render.com | Backend API | 750 hrs/month free |
| Supabase | Database | 500MB forever free |
| HuggingFace | AI models | Free inference API |
| Google Gemini Flash | Explanations | 1,500 calls/day free |
| Groq | Llama 3.1 70B | 14,400 tokens/day free |
| Adzuna Jobs API | Opportunity data | 1,000 calls/day free |
| RemoteOK API | Remote jobs | Completely free |

**Total monthly cost: $0.00**

---

## Quick Start

### 1. Clone
```bash
git clone https://github.com/dipeshrayg/unveiled
cd unveiled
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in your free API keys
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Extension
- Open Chrome → `chrome://extensions`
- Enable Developer Mode
- Click "Load Unpacked" → select `extension/` folder

---

## Get Free API Keys

1. **HuggingFace** — [huggingface.co](https://huggingface.co) → Settings → Access Tokens
2. **Gemini Flash** — [aistudio.google.com](https://aistudio.google.com) → Get API Key
3. **Groq** — [console.groq.com](https://console.groq.com) → Create API Key
4. **Adzuna** — [developer.adzuna.com](https://developer.adzuna.com) → Register
5. **Supabase** — [supabase.com](https://supabase.com) → New Project

---

## Research

This project is designed for academic publication. See [RESEARCH.md](RESEARCH.md) for:
- Full problem statement and literature context
- Methodology and scoring algorithms
- Citation format (BibTeX)
- arXiv preprint link

---

## Privacy

**We store zero personal data. Ever.**
- No names. No full URLs. No email addresses. No user accounts.
- Only domain names and aggregate scores are stored.
- All browsing analysis is anonymized at the extension level.
- Anonymous session IDs are randomly generated per session.

---

## Contributing

This is open-source research infrastructure. PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — Free forever. Build on it.

---

*UNVEILED was created because two civilizational problems were discovered that nobody had named. This project names them. Measures them. And gives every human being a tool to see past them.*
