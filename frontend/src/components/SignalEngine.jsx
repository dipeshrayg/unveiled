import { useState, useEffect } from "react";
import RealityScore from "./RealityScore";
import ContentAnalysis from "./ContentAnalysis";
import GlobalMap from "./GlobalMap";
import { api } from "../utils/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const MOCK_TIMELINE = [
  { time: "09:00", score: 82 }, { time: "09:30", score: 71 }, { time: "10:00", score: 34 },
  { time: "10:30", score: 58 }, { time: "11:00", score: 88 }, { time: "11:30", score: 45 },
  { time: "12:00", score: 63 }, { time: "12:30", score: 77 },
];

function readScanFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("scan");
    if (encoded) return JSON.parse(atob(encoded));
  } catch {}
  return null;
}

export default function SignalEngine() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("demo"); // "live" | "demo"

  useEffect(() => {
    // First: try to read real scan passed from extension via URL param
    const urlScan = readScanFromUrl();
    if (urlScan && urlScan.reality_score !== undefined) {
      setData(urlScan);
      setSource("live");
      setLoading(false);
    }

    // Always fetch aggregate stats
    api.getStats()
      .then(s => setStats(s))
      .catch(() => {});

    // If no URL scan, fall back to backend demo endpoint
    if (!urlScan) {
      api.scanDemo()
        .then(d => { setData(d); setSource("demo"); })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, []);

  const avgScore = MOCK_TIMELINE.reduce((s, d) => s + d.score, 0) / MOCK_TIMELINE.length;

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>SIGNAL Engine</h1>
        <span style={{
          fontSize: 11, padding: "2px 10px", borderRadius: 10, fontWeight: 600,
          background: source === "live" ? "#14532d" : "#1e293b",
          color: source === "live" ? "#22c55e" : "#64748b",
        }}>
          {source === "live" ? "● LIVE SCAN" : "DEMO DATA"}
        </span>
      </div>
      <p style={{ color: "#64748b", marginBottom: 32 }}>
        Reality Purity Scoring — {source === "live"
          ? "showing your last scanned page result"
          : "open any page with the extension active, then click Full Analysis →"}
      </p>

      {error && (
        <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: 8,
          padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#fca5a5" }}>
          Backend unavailable — {error}. Visit{" "}
          <a href="https://unveiled-m7w0.onrender.com/health" target="_blank"
            rel="noopener noreferrer" style={{ color: "#f87171" }}>
            this link
          </a>{" "}to wake the server, then refresh.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12,
            padding: 24, display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 16, letterSpacing: "0.06em" }}>
              {source === "live" ? "LAST SCANNED PAGE" : "DEMO SCAN RESULT"}
            </p>
            {data && <RealityScore score={data.reality_score} />}
          </div>

          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12,
            padding: 16, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#eab308" }}>
              {Math.round(avgScore)}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {stats?.total_scans > 0
                ? `Avg across ${stats.total_scans} total scans`
                : "Average Score (Demo)"}
            </div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Reality Score Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6 }}
                labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#60a5fa" }}
              />
              <Line type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={2}
                dot={{ fill: "#60a5fa", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data && <ContentAnalysis data={data} />}

      {source !== "live" && (
        <div style={{
          margin: "20px 0", background: "#0f172a", border: "1px solid #334155",
          borderRadius: 12, padding: 16, textAlign: "center"
        }}>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            To see a <strong style={{ color: "#60a5fa" }}>live scan</strong> here:
          </p>
          <ol style={{ textAlign: "left", maxWidth: 400, margin: "10px auto 0", color: "#64748b", fontSize: 12, lineHeight: 2 }}>
            <li>Open any website (e.g. bbc.com or cnn.com)</li>
            <li>Wait for the score badge to appear (top-right corner)</li>
            <li>Click the UNVEILED extension icon → click <strong style={{ color: "#e2e8f0" }}>Full Analysis →</strong></li>
          </ol>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <GlobalMap stats={stats} />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
      <div style={{
        width: 40, height: 40, border: "3px solid #1e293b",
        borderTopColor: "#60a5fa", borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
    </div>
  );
}
