import { bubbleToLabel } from "../utils/scoring";

const R = 50;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function FilterBubble({ data }) {
  if (!data) return null;
  const score = data.bubble_score ?? 50;
  const label = bubbleToLabel(score);
  const color = score >= 80 ? "#ef4444" : score >= 60 ? "#f97316" : score >= 40 ? "#eab308" : "#22c55e";
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const size = 100;

  const diversityBars = [
    { label: "Source Diversity",   value: data.source_diversity   ?? 0 },
    { label: "Political Balance",  value: data.political_diversity ?? 0 },
    { label: "Topic Diversity",    value: data.topic_diversity     ?? 0 },
    { label: "Global Reach",       value: data.geo_diversity       ?? 0 },
  ];

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, letterSpacing: "0.06em" }}>
        FILTER BUBBLE ANALYSIS
      </h3>

      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
        {/* Circle */}
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
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
            <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>bubble</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
          {data.dominant_narrative && (
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>
              Pattern: {data.dominant_narrative}
            </div>
          )}
          {data.recommendation && (
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
              {data.recommendation}
            </div>
          )}
        </div>
      </div>

      {/* Diversity bars */}
      {diversityBars.map(({ label: l, value }) => (
        <div key={l} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{l}</span>
            <span style={{ fontSize: 11, color: "#64748b" }}>{Math.round(value * 100)}%</span>
          </div>
          <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.round(value * 100)}%`,
              background: "#a78bfa", borderRadius: 3, transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      ))}

      {(data.missing_perspectives ?? []).length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 11, color: "#a78bfa", marginBottom: 6 }}>Missing Perspectives</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {data.missing_perspectives.map(m => (
              <span key={m} style={{
                background: "#2e106544", border: "1px solid #a78bfa44",
                color: "#c4b5fd", fontSize: 10, padding: "2px 8px", borderRadius: 10,
              }}>{m}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
