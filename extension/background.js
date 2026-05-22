// UNVEILED — Background Service Worker
// Manages API calls, caching, and communication between content script and popup.

const API_BASE = "https://unveiled-api.onrender.com";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ── Session ID ────────────────────────────────────────────────────────────────
function generateSessionId() {
  return "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function getSessionId() {
  const data = await chrome.storage.local.get("session_id");
  if (data.session_id) return data.session_id;
  const id = generateSessionId();
  await chrome.storage.local.set({ session_id: id });
  return id;
}

// ── Cache ─────────────────────────────────────────────────────────────────────
async function getCachedScan(domain) {
  const key = `scan_${domain}`;
  const data = await chrome.storage.local.get(key);
  const entry = data[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
  return entry.result;
}

async function cacheScan(domain, result) {
  const key = `scan_${domain}`;
  await chrome.storage.local.set({ [key]: { result, timestamp: Date.now() } });
}

// ── API Calls ─────────────────────────────────────────────────────────────────
async function callSignalScan(pageData, sessionId) {
  const cached = await getCachedScan(pageData.domain);
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE}/api/signal/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: pageData.url,
        domain: pageData.domain,
        title: pageData.title,
        text: pageData.text.slice(0, 3000),
        meta_description: pageData.metaDescription,
        author: pageData.author,
        outbound_links: pageData.outboundLinks.slice(0, 20),
        has_images: pageData.hasImages,
        has_videos: pageData.hasVideos,
        session_id: sessionId,
        country_code: "US",
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    await cacheScan(pageData.domain, result);
    return result;
  } catch (err) {
    console.error("[UNVEILED] Signal scan failed:", err);
    return null;
  }
}

async function callBubbleAudit(domains, sessionId) {
  try {
    const response = await fetch(`${API_BASE}/api/lens/bubble-audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domains, session_id: sessionId }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("[UNVEILED] Bubble audit failed:", err);
    return null;
  }
}

// ── History Extraction ────────────────────────────────────────────────────────
async function getRecentDomains() {
  try {
    const history = await chrome.history.search({
      text: "",
      maxResults: 50,
      startTime: Date.now() - 24 * 60 * 60 * 1000,
    });
    const domains = new Set();
    for (const item of history) {
      try {
        const url = new URL(item.url);
        const domain = url.hostname.replace(/^www\./, "");
        if (domain && !domain.includes("chrome") && !domain.includes("extension")) {
          domains.add(domain);
        }
      } catch {}
    }
    return [...domains].slice(0, 20);
  } catch {
    return [];
  }
}

// ── Scan History Storage ──────────────────────────────────────────────────────
async function saveScanToHistory(domain, result) {
  const data = await chrome.storage.local.get("scan_history");
  const history = data.scan_history || [];
  history.unshift({ domain, result, timestamp: Date.now() });
  // Keep last 100 scans
  await chrome.storage.local.set({ scan_history: history.slice(0, 100) });
}

// ── Message Handler ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_PAGE") {
    (async () => {
      const sessionId = await getSessionId();
      const signalResult = await callSignalScan(message.data, sessionId);
      const domains = await getRecentDomains();
      const bubbleResult = await callBubbleAudit(domains, sessionId);

      if (signalResult) {
        await saveScanToHistory(message.data.domain, signalResult);
        // Notify content script about score for floating badge
        try {
          await chrome.tabs.sendMessage(sender.tab.id, {
            type: "SCORE_RESULT",
            score: signalResult.reality_score,
            color: signalResult.color,
          });
        } catch {}
      }

      sendResponse({ signal: signalResult, lens: bubbleResult });
    })();
    return true; // keep message channel open for async response
  }

  if (message.type === "GET_POPUP_DATA") {
    (async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab) return sendResponse(null);
      const cached = await getCachedScan(new URL(tab.url).hostname.replace(/^www\./, ""));
      const domains = await getRecentDomains();
      const sessionId = await getSessionId();
      const bubbleResult = await callBubbleAudit(domains, sessionId);
      sendResponse({ signal: cached, lens: bubbleResult, tabUrl: tab.url });
    })();
    return true;
  }
});
