import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import SignalEngine from "./components/SignalEngine";
import LensEngine from "./components/LensEngine";
import ResearchPanel from "./components/ResearchPanel";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/signal", label: "📡 SIGNAL" },
  { to: "/lens", label: "🔍 LENS" },
  { to: "/research", label: "🎓 Research" },
];

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        background: "#0a0e1a",
        borderBottom: "1px solid #1e293b",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <NavLink to="/" style={{ marginRight: 16, textDecoration: "none" }}>
          <span style={{
            fontSize: 18, fontWeight: 900, letterSpacing: "0.1em",
            background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            UNVEILED
          </span>
        </NavLink>

        {NAV_LINKS.map(({ to, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            style={({ isActive }) => ({
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "#60a5fa" : "#64748b",
              background: isActive ? "#1e293b" : "transparent",
              transition: "all 0.15s",
            })}>
            {label}
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />
        <a href="https://github.com/dipeshrayg/unveiled" target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: "#475569", textDecoration: "none" }}>
          GitHub ↗
        </a>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, padding: "32px 24px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signal" element={<SignalEngine />} />
          <Route path="/lens" element={<LensEngine />} />
          <Route path="/research" element={<ResearchPanel />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1e293b",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "#334155",
      }}>
        <span>UNVEILED — Zero cost. Open source. MIT License.</span>
        <span>
          <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer"
            style={{ color: "#475569", marginRight: 12 }}>arXiv</a>
          <a href="https://zenodo.org" target="_blank" rel="noopener noreferrer"
            style={{ color: "#475569" }}>Zenodo</a>
        </span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
