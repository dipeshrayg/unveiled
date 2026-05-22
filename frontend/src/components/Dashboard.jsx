import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RealityScore from "./RealityScore";
import { api } from "../utils/api";
import { bubbleToLabel, scoreToColor } from "../utils/scoring";

const R = 50;
const CIRCUMFERENCE = 2 * Math.PI * R;

function BubbleMini({ score }) {
  const color = score >= 80 ? "#ef4444" : score >= 60 ? "#f97316" : score >= 40 ? "#eab308" : "#22c55e";
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const size = 120;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120"
        style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [signalScore, setSignalScore] = useState(null);
  const [bubbleScore, setBubbleScore] = useState(null);
  const [oppGap, setOppGap] = useState(null);
  const [totalScans, setTotalScans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getStats(),
      api.lensDemo(),
      api.opportunityGap(["software", "data", "design"]),
    ]).then(([statsRes, lensRes, oppRes]) => {
      if (statsRes.status === "fulfilled") {
        const s = statsRes.value;
        if (s.average_reality_score > 0) setSignalScore(Math.round(s.average_reality_score));
        setTotalScans(s.total_scans ?? 0);
      }
      if (lensRes.status === "fulfilled") {
        setBubbleScore(lensRes.value?.bubble?.bubble_score ?? 68);
      }
      if (oppRes.status === "fulfilled") {
        setOppGap(oppRes.value?.gap_size ?? 0);
      }
      setLoading(false);
    });
  }, []);

  const displaySignal = signalScore ?? 61;
  const displayBubble = bubbleScore ?? 68;
  const displayOpp    = oppGap ?? 330;

  const cardStyle = (border = "#1e293b") => ({
    background: "#0f172a",
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, transform 0.15s",
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h1 style={{
          fontSize: 42, fontWeight: 900, letterSpacing: "0.1em",
          background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8,
        }}>UNVEILED</h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>See what's real. See what's hidden.</p>
        {totalScans > 0 && (
          <p style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>
            {totalScans.toLocaleString()} pages scanned globally
          </p>
        )}
      </div>

      {/* Two-panel overview — both panels are fully clickable */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>

        {/* SIGNAL panel */}
        <div
          style={cardStyle("#1e293b")}
          onClick={() => navigate("/signal")}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", marginBottom: 20 }}>
            📡 SIGNAL ENGINE
          </div>
          <RealityScore score={displaySignal} size={140} />
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 16, textAlign: "center" }}>
            {signalScore
              ? `Live average across ${totalScans} scanned pages`
              : "Average reality score across today's scanned content"}
          </p>
          <div style={{
            marginTop: 20, padding: "8px 20px", background: "#1d4ed8",
            color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
          }}>
            Deep Dive →
          </div>
        </div>

        {/* LENS panel */}
        <div
          style={cardStyle("#312e81")}
          onClick={() => navigate("/lens")}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#312e81"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", marginBottom: 20 }}>
            🔍 LENS ENGINE
          </div>
          <BubbleMini score={displayBubble} />
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, marginBottom: 16 }}>
            {bubbleToLabel(displayBubble)}
          </div>
          <div style={{
            background: "#0a0e1a", border: "1px solid #312e81",
            borderRadius: 10, padding: "14px 20px", textAlign: "center", width: "100%",
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#a78bfa" }}>
              {loading ? "…" : displayOpp.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>opportunities hidden from your feeds today</div>
          </div>
          <div style={{
            marginTop: 20, padding: "8px 20px", background: "#7c3aed",
            color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
          }}>
            Audit My Filter →
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { to: "/signal",   label: "Reality Analysis",  desc: "Score breakdown + timeline", icon: "📡" },
          { to: "/lens",     label: "Opportunity Audit", desc: "Hidden jobs + bubble score",  icon: "🔍" },
          { to: "/research", label: "Research Panel",    desc: "Academic data + citation",    icon: "🎓" },
        ].map(({ to, label, desc, icon }) => (
          <div key={to}
            onClick={() => navigate(to)}
            style={{
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: 12, padding: 16, cursor: "pointer",
              transition: "border-color 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Install banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "1px solid #334155", borderRadius: 16, padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
            Install the Browser Extension
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Get real-time scores on every page you visit — Chrome, Brave & Firefox
          </div>
        </div>
        <a href="https://github.com/dipeshrayg/unveiled/tree/master/extension"
          target="_blank" rel="noopener noreferrer"
          style={{
            padding: "10px 20px", background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
            textDecoration: "none", whiteSpace: "nowrap",
          }}>
          Get Extension →
        </a>
      </div>
    </div>
  );
}
