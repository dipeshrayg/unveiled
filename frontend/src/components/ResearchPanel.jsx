import { useSignalEngine } from "../hooks/useSignalEngine";

const BIBTEX = `@software{unveiled2026,
  title     = {UNVEILED: A Dual-Engine AI System for Real-Time Detection of
               Reality Pollution and Algorithmic Opportunity Suppression},
  author    = {[Author Name]},
  year      = {2026},
  url       = {https://github.com/dipeshrayg/unveiled},
  license   = {MIT}
}`;

export default function ResearchPanel() {
  const { stats } = useSignalEngine();

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "unveiled-research-data.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Research Panel</h1>
      <p style={{ color: "#64748b", marginBottom: 32 }}>
        Designed for academic output — arXiv + Zenodo publication ready.
      </p>

      {/* Abstract */}
      <Section title="Project Abstract">
        <div style={{ background: "#0a0e1a", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
            We present <strong style={{ color: "#e2e8f0" }}>UNVEILED</strong>, an open-source browser
            extension and web dashboard that simultaneously addresses two previously unnamed
            civilizational-scale problems: (1) <em>Reality Pollution</em> — the systematic contamination
            of shared informational environments through AI-generated content, deepfakes, and algorithmic
            filter bubbles, and (2) the <em>Invisible Caste System</em> — the silent algorithmic sorting
            of individuals into opportunity tiers without transparency or recourse. Using an ensemble of
            open-source language models, retrieval-augmented analysis, and opportunity-gap detection via
            public employment APIs, UNVEILED provides real-time Reality Purity Scores and Algorithmic
            Opportunity Audits at zero cost to users. All code, data, and models are open source.
          </p>
          <button onClick={() => navigator.clipboard?.writeText(document.querySelector(".abstract-text")?.textContent)}
            style={btnStyle}>
            Copy Abstract
          </button>
        </div>
      </Section>

      {/* Live stats */}
      <Section title="Live Aggregate Statistics">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Total Scans", value: stats?.total_scans ?? 0 },
            { label: "Avg Reality Score", value: stats?.average_reality_score ?? "--" },
            { label: "Domains Tracked", value: stats?.most_polluted_domains?.length ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "#0a0e1a", border: "1px solid #1e293b",
              borderRadius: 8, padding: 16, textAlign: "center"
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#60a5fa" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <button onClick={downloadJSON} style={btnStyle}>Download Dataset (JSON)</button>
      </Section>

      {/* Citation */}
      <Section title="Citation (BibTeX)">
        <pre style={{
          background: "#0a0e1a", border: "1px solid #1e293b", borderRadius: 8,
          padding: 16, fontSize: 12, color: "#94a3b8", overflowX: "auto", lineHeight: 1.6
        }}>
          {BIBTEX}
        </pre>
        <button onClick={() => navigator.clipboard?.writeText(BIBTEX)} style={{ ...btnStyle, marginTop: 10 }}>
          Copy BibTeX
        </button>
      </Section>

      {/* Research questions */}
      <Section title="Research Questions">
        <ol style={{ paddingLeft: 20, color: "#94a3b8", fontSize: 13, lineHeight: 2 }}>
          <li>What is the average Reality Purity Score of content consumed across platform types?</li>
          <li>Is there a correlation between filter bubble score and reality score of consumed content?</li>
          <li>Does algorithmic profile type predict the size of the opportunity gap experienced?</li>
          <li>Can real-time scoring feedback change user content selection behavior over time?</li>
          <li>Which domains consistently score below 60 on the Reality Purity Index?</li>
        </ol>
      </Section>

      {/* Publish targets */}
      <Section title="Publication Targets">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { name: "arXiv (cs.AI / cs.CY)", url: "https://arxiv.org", status: "Free preprint" },
            { name: "Zenodo", url: "https://zenodo.org", status: "Free DOI for code + data" },
            { name: "GitHub", url: "https://github.com", status: "Permanent open-source home" },
          ].map(({ name, url, status }) => (
            <div key={name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "#0a0e1a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px"
            }}>
              <div>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{status}</div>
              </div>
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#60a5fa" }}>Visit →</a>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa", marginBottom: 12, letterSpacing: "0.04em" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

const btnStyle = {
  marginTop: 10,
  padding: "8px 16px",
  background: "#1e293b",
  color: "#94a3b8",
  border: "1px solid #334155",
  borderRadius: 6,
  fontSize: 12,
  cursor: "pointer",
};
