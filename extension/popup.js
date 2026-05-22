// UNVEILED — Popup Logic

const DASHBOARD_URL = "https://dipeshrayg.github.io/unveiled";

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove("hidden");
  });
});

// ── Utility ───────────────────────────────────────────────────────────────────
function show(id) { document.getElementById(id)?.classList.remove("hidden"); }
function hide(id) { document.getElementById(id)?.classList.add("hidden"); }

function animateRing(ringId, score, colorClass) {
  const ring = document.getElementById(ringId);
  if (!ring) return;
  const circumference = 314;
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = offset;
  // Apply color class
  ["color-GREEN", "color-YELLOW", "color-ORANGE", "color-RED"].forEach((c) =>
    ring.classList.remove(c)
  );
  if (colorClass) ring.classList.add(`color-${colorClass}`);
}

function animateBar(barId, value, max = 100) {
  const bar = document.getElementById(barId);
  if (bar) bar.style.width = `${Math.round((value / max) * 100)}%`;
}

// ── Render SIGNAL ─────────────────────────────────────────────────────────────
function renderSignal(data) {
  if (!data) {
    hide("signal-loading");
    show("signal-error");
    return;
  }

  hide("signal-loading");
  show("signal-result");

  const score = data.reality_score ?? 0;
  const color = data.color ?? "YELLOW";

  // Score circle
  document.getElementById("score-number").textContent = score;
  animateRing("ring-fill", score, color);

  // Badge
  const badge = document.getElementById("score-badge");
  badge.textContent = data.label ?? "Unknown";
  badge.className = `score-badge ${color}`;

  // Sub-scores
  const ai = Math.round((data.sub_scores?.ai_probability ?? 0) * 100);
  const manip = data.sub_scores?.manipulation_score ?? 0;
  const cred = data.sub_scores?.source_credibility ?? 50;

  animateBar("bar-ai", ai);
  animateBar("bar-manip", manip);
  animateBar("bar-cred", cred);

  document.getElementById("val-ai").textContent = `${ai}%`;
  document.getElementById("val-manip").textContent = `${manip}`;
  document.getElementById("val-cred").textContent = `${cred}`;

  // Explanation
  document.getElementById("explanation").textContent =
    data.explanation || "No explanation available.";

  // Flagged phrases
  const flags = data.flagged_phrases ?? [];
  if (flags.length > 0) {
    show("flags-section");
    const list = document.getElementById("flags-list");
    list.innerHTML = flags
      .map((f) => `<span class="flag-tag">${f}</span>`)
      .join("");
  }
}

// ── Render LENS ───────────────────────────────────────────────────────────────
function renderLens(data) {
  if (!data) {
    hide("lens-loading");
    show("lens-error");
    return;
  }

  hide("lens-loading");
  show("lens-result");

  const bubbleScore = data.bubble_score ?? 50;
  document.getElementById("bubble-number").textContent = bubbleScore;
  animateRing("bubble-ring-fill", bubbleScore, null); // purple

  document.getElementById("bubble-type").textContent =
    data.dominant_narrative
      ? `Dominant pattern: ${data.dominant_narrative}`
      : "";

  // Missing perspectives tags
  const missing = data.missing_perspectives ?? [];
  if (missing.length > 0) {
    const sec = document.getElementById("missing-section");
    sec.innerHTML = `
      <p class="missing-title">Missing perspectives</p>
      <div class="missing-tags">
        ${missing.map((m) => `<span class="missing-tag">${m}</span>`).join("")}
      </div>`;
  }

  // Recommendation
  document.getElementById("opp-recommendation").textContent =
    data.recommendation ?? "";
}

// ── Opportunity gap ───────────────────────────────────────────────────────────
async function loadOpportunityGap() {
  const stored = await chrome.storage.local.get("user_skills");
  const skills = stored.user_skills || ["software", "data", "design"];

  try {
    const resp = await fetch(
      `https://unveiled-m7w0.onrender.com/api/lens/opportunity-gap`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, country_code: "us" }),
      }
    );
    if (resp.ok) {
      const data = await resp.json();
      document.getElementById("opp-gap").textContent = data.gap_size ?? "--";
    }
  } catch {
    document.getElementById("opp-gap").textContent = "?";
  }
}

// ── Full analysis buttons — pass real scan data via URL param ─────────────────
document.getElementById("btn-full-signal")?.addEventListener("click", () => {
  const scoreEl = document.getElementById("score-number");
  const score = scoreEl?.textContent;
  // Grab whatever signal data is currently displayed and encode into URL
  const payload = {
    reality_score: parseInt(score) || 0,
    color: document.getElementById("score-badge")?.className.replace("score-badge ", "").trim(),
    label: document.getElementById("score-badge")?.textContent,
    explanation: document.getElementById("explanation")?.textContent,
    sub_scores: {
      ai_probability: parseFloat(document.getElementById("val-ai")?.textContent) / 100 || 0,
      manipulation_score: parseInt(document.getElementById("val-manip")?.textContent) || 0,
      source_credibility: parseInt(document.getElementById("val-cred")?.textContent) || 50,
    },
    flagged_phrases: [...document.querySelectorAll(".flag-tag")].map(el => el.textContent),
  };
  const encoded = btoa(JSON.stringify(payload));
  chrome.tabs.create({ url: `${DASHBOARD_URL}/signal?scan=${encoded}` });
});

document.getElementById("btn-full-lens")?.addEventListener("click", () => {
  chrome.tabs.create({ url: `${DASHBOARD_URL}/lens` });
});

// ── Init ──────────────────────────────────────────────────────────────────────
(async function init() {
  chrome.runtime.sendMessage({ type: "GET_POPUP_DATA" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      hide("signal-loading");
      show("signal-error");
      hide("lens-loading");
      show("lens-error");
      return;
    }
    renderSignal(response.signal);
    renderLens(response.lens);
  });

  // Load opportunity gap separately (slower API call)
  loadOpportunityGap();
})();
