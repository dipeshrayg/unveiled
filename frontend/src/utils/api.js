const API_BASE = import.meta.env.VITE_API_URL || "https://unveiled-m7w0.onrender.com";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  getStats: () => request("/api/signal/stats"),
  scanDemo: () => request("/api/signal/demo"),
  lensDemo: () => request("/api/lens/demo"),
  bubbleAudit: (domains) =>
    request("/api/lens/bubble-audit", {
      method: "POST",
      body: JSON.stringify({ domains }),
    }),
  opportunityGap: (skills, country = "us") =>
    request("/api/lens/opportunity-gap", {
      method: "POST",
      body: JSON.stringify({ skills, country_code: country }),
    }),
  algorithmicProfile: (domains) =>
    request("/api/lens/profile", {
      method: "POST",
      body: JSON.stringify({ domains }),
    }),
};
