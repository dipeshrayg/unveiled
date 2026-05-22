// UNVEILED — Content Script
// Extracts page data, sends to background, renders floating score badge.

(function () {
  "use strict";

  let badgeEl = null;
  let scanAttempted = false;

  // ── Page Data Extraction ────────────────────────────────────────────────────
  function extractPageData() {
    const url = window.location.href;
    const domain = window.location.hostname.replace(/^www\./, "");
    const title = document.title || "";
    const metaDescription =
      document.querySelector('meta[name="description"]')?.content || "";

    const clone = document.body.cloneNode(true);
    clone.querySelectorAll("script,style,nav,footer,header,aside,noscript").forEach(el => el.remove());
    const text = (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim();

    const authorSelectors = ['[rel="author"]',".author",".byline",'[itemprop="author"]','meta[name="author"]'];
    let author = "";
    for (const sel of authorSelectors) {
      const el = document.querySelector(sel);
      if (el) { author = el.tagName === "META" ? el.content : el.textContent?.trim() || ""; if (author) break; }
    }

    const links = [...document.querySelectorAll("a[href]")]
      .map(a => { try { return new URL(a.href).hostname; } catch { return null; } })
      .filter(h => h && h !== domain);

    return {
      url, domain, title, text, metaDescription, author,
      outboundLinks: [...new Set(links)].slice(0, 30),
      hasImages: document.querySelectorAll("img").length > 0,
      hasVideos: document.querySelectorAll("video,iframe[src*='youtube'],iframe[src*='vimeo']").length > 0,
    };
  }

  // ── Floating Badge ──────────────────────────────────────────────────────────
  function createBadge(score, color) {
    if (badgeEl) badgeEl.remove();

    const colorMap = {
      GREEN:  { bg: "#22c55e", text: "#fff" },
      YELLOW: { bg: "#eab308", text: "#000" },
      ORANGE: { bg: "#f97316", text: "#fff" },
      RED:    { bg: "#ef4444", text: "#fff" },
    };
    const palette = colorMap[color] || colorMap.YELLOW;

    badgeEl = document.createElement("div");
    badgeEl.id = "unveiled-badge";
    badgeEl.textContent = score;

    const style = {
      position: "fixed", top: "80px", right: "16px", zIndex: "2147483647",
      width: "44px", height: "44px", borderRadius: "50%",
      background: palette.bg, color: palette.text,
      fontFamily: "system-ui,sans-serif", fontSize: "14px", fontWeight: "700",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)", cursor: "pointer",
      userSelect: "none", transition: "transform 0.15s",
      border: "2px solid rgba(255,255,255,0.2)",
    };
    Object.assign(badgeEl.style, style);
    badgeEl.title = `UNVEILED Reality Score: ${score}/100 — Click to open`;
    badgeEl.addEventListener("mouseenter", () => badgeEl.style.transform = "scale(1.12)");
    badgeEl.addEventListener("mouseleave", () => badgeEl.style.transform = "scale(1)");

    // Show pending state while waiting for score
    if (score === "…") {
      badgeEl.style.background = "#334155";
      badgeEl.style.color = "#94a3b8";
      badgeEl.style.fontSize = "18px";
    }

    document.body.appendChild(badgeEl);
  }

  function updateBadge(score, color) {
    if (!badgeEl) { createBadge(score, color); return; }
    const colorMap = { GREEN:"#22c55e", YELLOW:"#eab308", ORANGE:"#f97316", RED:"#ef4444" };
    badgeEl.textContent = score;
    badgeEl.style.background = colorMap[color] || "#eab308";
    badgeEl.style.color = color === "YELLOW" ? "#000" : "#fff";
    badgeEl.style.fontSize = "14px";
  }

  // ── Send to background with retry ───────────────────────────────────────────
  function sendToBackground(pageData, retries = 3) {
    chrome.runtime.sendMessage({ type: "SCAN_PAGE", data: pageData }, (response) => {
      if (chrome.runtime.lastError) {
        // Background worker not ready — retry after delay
        if (retries > 0) {
          setTimeout(() => sendToBackground(pageData, retries - 1), 2000);
        }
        return;
      }
      if (response?.signal) {
        updateBadge(response.signal.reality_score, response.signal.color);
      }
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    if (scanAttempted) return;

    const url = window.location.href;
    if (
      url.startsWith("chrome://") || url.startsWith("chrome-extension://") ||
      url.startsWith("brave://") || url.startsWith("about:") ||
      url.startsWith("moz-extension://") || url.startsWith("edge://") ||
      url.length < 10
    ) return;

    scanAttempted = true;

    // Show pending badge immediately so user knows extension is working
    createBadge("…", "PENDING");

    const pageData = extractPageData();
    sendToBackground(pageData);
  }

  // ── Listen for score pushed back from background ────────────────────────────
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SCORE_RESULT") {
      updateBadge(message.score, message.color);
    }
  });

  // Run when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // Some pages fire load after DOMContentLoaded — slight delay improves reliability
    setTimeout(init, 500);
  }
})();
