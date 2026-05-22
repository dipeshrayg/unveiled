import FilterBubble from "./FilterBubble";
import OpportunityGap from "./OpportunityGap";
import { useLensEngine } from "../hooks/useLensEngine";

export default function LensEngine() {
  const { demo, opportunities, loading, error } = useLensEngine();

  if (loading) return <Spinner />;

  const bubble = demo?.bubble;
  const profile = demo?.profile;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>LENS Engine</h1>
      <p style={{ color: "#64748b", marginBottom: 32 }}>
        Algorithmic Opportunity Auditor — exposing what's being hidden from you.
      </p>

      {error && (
        <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: 8,
          padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#fca5a5" }}>
          Backend unavailable — showing demo data. {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <FilterBubble data={bubble} />
        <OpportunityGap data={opportunities || demo?.opportunity} />
      </div>

      {/* Algorithmic Profile */}
      {profile && (
        <div style={{ background: "#0f172a", border: "1px solid #312e81", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 13, color: "#a78bfa", marginBottom: 16, letterSpacing: "0.06em" }}>
            YOUR ALGORITHMIC PROFILE
          </h3>
          <div style={{ background: "#0a0e1a", borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{profile.likely_profile}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#ef4444", marginBottom: 8 }}>Opportunity Blind Spots</p>
              <ul style={{ paddingLeft: 16, color: "#94a3b8", fontSize: 12, lineHeight: 2 }}>
                {(profile.opportunity_blind_spots || []).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#22c55e", marginBottom: 8 }}>Recommendations</p>
              <ul style={{ paddingLeft: 16, color: "#94a3b8", fontSize: 12, lineHeight: 2 }}>
                {(profile.recommendations || []).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {profile.filter_bubble_type && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
              Bubble type: <span style={{ color: "#a78bfa" }}>{profile.filter_bubble_type}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
      <div style={{
        width: 40, height: 40, border: "3px solid #1e293b",
        borderTopColor: "#a78bfa", borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
    </div>
  );
}
