import { scoreToColor, scoreToLabel } from "../utils/scoring";

const R = 50;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function RealityScore({ score = 0, size = 160 }) {
  const color = scoreToColor(score);
  const label = scoreToLabel(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Wrapper keeps SVG + text in the same stacking context */}
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Ring */}
        <svg
          width={size} height={size}
          viewBox="0 0 120 120"
          style={{ transform: "rotate(-90deg)", display: "block" }}
        >
          <circle cx="60" cy="60" r={R} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={R}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s" }}
          />
        </svg>
        {/* Text centered absolutely over the SVG — no margin tricks */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{ fontSize: size * 0.22, fontWeight: 800, color, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: size * 0.09, color: "#64748b", marginTop: 2 }}>
            / 100
          </span>
        </div>
      </div>

      {/* Label pill */}
      <div style={{
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 20,
        padding: "3px 14px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}>
        {label}
      </div>
    </div>
  );
}
