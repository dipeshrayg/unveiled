import { Link } from "react-router-dom";
import RealityScore from "./RealityScore";
import { scoreToColor } from "../utils/scoring";

const MOCK_SIGNAL_SCORE = 61;
const MOCK_BUBBLE_SCORE = 68;
const MOCK_OPP_GAP = 330;

export default function Dashboard() {
  const bubbleColor = MOCK_BUBBLE_SCORE >= 70 ? "#ef4444" : MOCK_BUBBLE_SCORE >= 50 ? "#f97316" : "#22c55e";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h1 style={{
          fontSize: 42, fontWeight: 900, letterSpacing: "0.1em",
          background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8
        }}>
          UNVEILED
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>See what's real. See what's hidden.</p>
      </div>

      {/* Two-panel overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* SIGNAL panel */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", marginBottom: 20 }}>
            📡 SIGNAL ENGINE
          </div>
          <RealityScore score={MOCK_SIGNAL_SCORE} size={140} />
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 16, textAlign: "center" }}>
            Average reality score across today's scanned content
          </p>
          <Link to="/signal" style={{
            marginTop: 20, padding: "8px 20px", background: "#1d4ed8",
            color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
            textDecoration: "none"
          }}>
            Deep Dive →
          </Link>
        </div>

        {/* LENS panel */}
        <div style={{
          background: "#0f172a", border: "1px solid #312e81",
          borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", marginBottom: 20 }}>
            🔍 LENS ENGINE
          </div>

          {/* Bubble score */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: bubbleColor }}>
              {MOCK_BUBBLE_SCORE}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Filter Bubble Score (0=free, 100=trapped)</div>
          </div>

          {/* Opportunity gap */}
          <div style={{
            background: "#0a0e1a", border: "1px solid #312e81",
            borderRadius: 10, padding: "14px 20px", textAlign: "center", width: "100%"
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#a78bfa" }}>{MOCK_OPP_GAP}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>opportunities hidden from your feeds today</div>
          </div>

          <Link to="/lens" style={{
            marginTop: 20, padding: "8px 20px", background: "#7c3aed",
            color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
            textDecoration: "none"
          }}>
            Audit My Filter →
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { to: "/signal", label: "Reality Analysis", desc: "Score breakdown + timeline", icon: "📡" },
          { to: "/lens", label: "Opportunity Audit", desc: "Hidden jobs + bubble score", icon: "🔍" },
          { to: "/research", label: "Research Panel", desc: "Academic data + citation", icon: "🎓" },
        ].map(({ to, label, desc, icon }) => (
          <Link key={to} to={to} style={{
            display: "block", background: "#0f172a", border: "1px solid #1e293b",
            borderRadius: 12, padding: 16, textDecoration: "none",
            transition: "border-color 0.2s",
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{desc}</div>
          </Link>
        ))}
      </div>

      {/* Install banner */}
      <div style={{
        marginTop: 32, background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "1px solid #334155", borderRadius: 16, padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
            Install the Browser Extension
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Get real-time scores on every page you visit — Chrome + Firefox
          </div>
        </div>
        <a href="https://github.com/dipeshrayg/unveiled/tree/main/extension"
          target="_blank" rel="noopener noreferrer"
          style={{
            padding: "10px 20px", background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
            textDecoration: "none", whiteSpace: "nowrap"
          }}>
          Get Extension →
        </a>
      </div>
    </div>
  );
}
