export default function GlobalMap({ stats }) {
  const domains = stats?.most_polluted_domains ?? [];

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.06em" }}>
        MOST POLLUTED DOMAINS
      </h3>
      <p style={{ fontSize: 11, color: "#475569", marginBottom: 16 }}>
        Aggregate scores across all anonymous scans
      </p>

      {domains.length === 0 ? (
        <div style={{ textAlign: "center", color: "#475569", padding: "24px 0", fontSize: 12 }}>
          No aggregate data yet — install the extension to contribute scans.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {domains.slice(0, 10).map((d, i) => {
            const score = Math.round(d.avg_score);
            const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";
            return (
              <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 18, fontSize: 11, color: "#475569", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.domain}
                </span>
                <div style={{ width: 80, height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 3 }} />
                </div>
                <span style={{ width: 28, textAlign: "right", fontSize: 11, color, flexShrink: 0 }}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
