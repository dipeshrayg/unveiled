import RealityScore from "./RealityScore";
import ContentAnalysis from "./ContentAnalysis";
import GlobalMap from "./GlobalMap";
import { useSignalEngine } from "../hooks/useSignalEngine";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mock timeline data until real user scans populate
const MOCK_TIMELINE = [
  { time: "09:00", score: 82 }, { time: "09:30", score: 71 }, { time: "10:00", score: 34 },
  { time: "10:30", score: 58 }, { time: "11:00", score: 88 }, { time: "11:30", score: 45 },
  { time: "12:00", score: 63 }, { time: "12:30", score: 77 },
];

export default function SignalEngine() {
  const { data, stats, loading, error } = useSignalEngine();

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const avgScore = MOCK_TIMELINE.reduce((s, d) => s + d.score, 0) / MOCK_TIMELINE.length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>SIGNAL Engine</h1>
      <p style={{ color: "#64748b", marginBottom: 32 }}>Reality Purity Scoring — live analysis of every page you visit.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 24 }}>
        {/* Score + demo result */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12,
            padding: 24, display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 16, letterSpacing: "0.06em" }}>
              DEMO SCAN RESULT
            </p>
            {data && <RealityScore score={data.reality_score} />}
          </div>

          {/* Average today */}
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#eab308" }}>
              {Math.round(avgScore)}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Average Score Today</div>
          </div>
        </div>

        {/* Timeline chart */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Reality Score Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6 }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#60a5fa" }}
              />
              <Line type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={2}
                dot={{ fill: "#60a5fa", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content analysis */}
      {data && <ContentAnalysis data={data} />}

      {/* Global map */}
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

function ErrorMsg({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: 64, color: "#ef4444" }}>
      <p>Could not connect to backend.</p>
      <small style={{ color: "#64748b" }}>{msg}</small>
    </div>
  );
}
