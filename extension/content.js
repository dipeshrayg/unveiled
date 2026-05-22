// UNVEILED — Content Script
// Extracts page data, sends to background, renders floating score badge.

(function () {
  "use strict";

  let badgeEl = null;

  // ── Page Data Extraction ────────────────────────────────────────────────────
  function extractPageData() {
    const url = window.location.href;
    const domain = window.location.hostname.replace(/^www\./, "");
    const title = document.title || "";
    const metaDescription =
      document.querySelector('meta[name="description"]')?.content || "";

    // Full text — remove script/style noise
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll("script, style, nav, footer, header, aside").forEach((el) =>
      el.remove()
    );
    const text = (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim();

    // Author detection
    const authorSelectors = [
      '[rel="author"]',
      ".author",
      ".byline",
      '[itemprop="author"]',
      'meta[name="author"]',
    ];
    let author = "";
    for (const sel of authorSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        author = el.tagName === "META" ? el.content : el.textContent?.trim() || "";
        if (author) break;
      }
    }

    // Outbound links
    const links = [...document.querySelectorAll("a[href]")]
      .map((a) => {
        try {
          return new URL(a.href).hostname;
        } catch {
          return null;
        }
      })
      .filter((h) => h && h !== domain);

    const hasImages = document.querySelectorAll("img").length > 0;
    const hasVideos =
      document.querySelectorAll("video, iframe[src*='youtube'], iframe[src*='vimeo']").length > 0;

    return {
      url,
      domain,
      title,
      text,
      metaDescription,
      author,
      outboundLinks: [...new Set(links)].slice(0, 30),
      hasImages,
      hasVideos,
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
    Object.assign(badgeEl.style, {
      position:     "fixed",
      top:          "80px",
      right:        "16px",
      zIndex:       "2147483647",
      width:        "44px",
      height:       "44px",
      borderRadius: "50%",
      background:   palette.bg,
      color:        palette.text,
      fontFamily:   "system-ui, sans-serif",
      fontSize:     "14px",
      fontWeight:   "700",
      display:      "flex",
      alignItems:   "center",
      justifyContent: "center",
      boxShadow:    "0 2px 8px rgba(0,0,0,0.4)",
      cursor:       "pointer",
      userSelect:   "none",
      transition:   "transform 0.15s",
    });

    badgeEl.title = `UNVEILED Reality Score: ${score}/100`;
    badgeEl.addEventListener("mouseenter", () => (badgeEl.style.transform = "scale(1.1)"));
    badgeEl.addEventListener("mouseleave", () => (badgeEl.style.transform = "scale(1)"));
    badgeEl.addEventListener("click", () => chrome.runtime.sendMessage({ type: "OPEN_POPUP" }));

    document.body.appendChild(badgeEl);
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    // Skip non-content pages
    const url = window.location.href;
    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("moz-extension://")
    ) {
      return;
    }

    const pageData = extractPageData();

    // Send to background for analysis
    chrome.runtime.sendMessage({ type: "SCAN_PAGE", data: pageData }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response?.signal) {
        createBadge(response.signal.reality_score, response.signal.color);
      }
    });
  }

  // ── Listen for score pushed from background ─────────────────────────────────
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SCORE_RESULT") {
      createBadge(message.score, message.color);
    }
  });

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
