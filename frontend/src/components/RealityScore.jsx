import { scoreToColor, scoreToLabel } from "../utils/scoring";

const CIRCUMFERENCE = 2 * Math.PI * 50; // r=50

export default function RealityScore({ score = 0, size = 160 }) {
  const color = scoreToColor(score);
  const label = scoreToLabel(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="50"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s" }}
        />
      </svg>
      <div style={{ marginTop: -size * 0.6, textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 800, color }}>{score}</div>
        <div style={{ fontSize: size * 0.09, color: "#64748b" }}>/ 100</div>
      </div>
      <div style={{
        marginTop: size * 0.55,
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 20,
        padding: "3px 14px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
      }}>
        {label}
      </div>
    </div>
  );
}
