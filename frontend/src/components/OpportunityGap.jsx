export default function OpportunityGap({ data }) {
  if (!data) return null;

  const { total_found, estimated_shown, gap_size, opportunities = [], gap_explanation } = data;

  return (
    <div style={{ background: "#0f172a", border: "1px solid #312e81", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, letterSpacing: "0.06em" }}>
        OPPORTUNITY GAP
      </h3>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Found", value: total_found, color: "#60a5fa" },
          { label: "Likely Shown", value: estimated_shown, color: "#94a3b8" },
          { label: "Hidden Gap", value: gap_size, color: "#a78bfa" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, background: "#0a0e1a", border: "1px solid #1e293b",
            borderRadius: 8, padding: "12px 8px", textAlign: "center"
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value ?? "--"}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {gap_explanation && (
        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>
          {gap_explanation}
        </p>
      )}

      {/* Job listings */}
      {opportunities.length > 0 && (
        <>
          <h4 style={{ fontSize: 12, color: "#a78bfa", marginBottom: 10 }}>
            Hidden Opportunities Found
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
            {opportunities.map((job, i) => (
              <a key={i} href={job.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "block",
                  background: "#0a0e1a",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  padding: "10px 12px",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{job.title}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {job.company} · {job.location}
                  <span style={{ marginLeft: 8, color: "#475569" }}>via {job.source}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
