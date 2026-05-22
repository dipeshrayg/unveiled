export default function ContentAnalysis({ data }) {
  if (!data) return null;
  const { sub_scores, flagged_phrases = [], source_bias, source_factual, domain } = data;

  const bars = [
    { label: "AI-Generated", value: Math.round((sub_scores?.ai_probability ?? 0) * 100), danger: true },
    { label: "Manipulation", value: sub_scores?.manipulation_score ?? 0, danger: true },
    { label: "Source Trust", value: sub_scores?.source_credibility ?? 50, danger: false },
  ];

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, letterSpacing: "0.06em" }}>
        CONTENT BREAKDOWN
      </h3>

      {/* Domain info */}
      <div style={{ marginBottom: 14, fontSize: 12, color: "#64748b" }}>
        <span style={{ color: "#94a3b8" }}>{domain}</span>
        {source_bias !== "unknown" && (
          <span style={{ marginLeft: 8, background: "#1e293b", padding: "2px 8px", borderRadius: 10 }}>
            {source_bias}
          </span>
        )}
        {source_factual !== "unknown" && (
          <span style={{ marginLeft: 6, background: "#1e293b", padding: "2px 8px", borderRadius: 10 }}>
            {source_factual} factual
          </span>
        )}
      </div>

      {/* Bars */}
      {bars.map(({ label, value, danger }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{value}</span>
          </div>
          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${value}%`,
              background: danger ? "#ef4444" : "#22c55e",
              borderRadius: 3,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      ))}

      {/* Flagged phrases */}
      {flagged_phrases.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 11, color: "#f97316", marginBottom: 6 }}>⚠ Flagged Phrases</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {flagged_phrases.map((f) => (
              <span key={f} style={{
                background: "#7c2d1244",
                border: "1px solid #f9731644",
                color: "#fed7aa",
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 10,
              }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {data.explanation && (
        <p style={{ marginTop: 14, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
          {data.explanation}
        </p>
      )}
    </div>
  );
}
