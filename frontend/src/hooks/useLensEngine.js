import { useState, useEffect } from "react";
import { api } from "../utils/api";

export function useLensEngine(skills = ["software", "data", "design"]) {
  const [demo, setDemo] = useState(null);
  const [opportunities, setOpportunities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [demoData, oppData] = await Promise.all([
          api.lensDemo(),
          api.opportunityGap(skills),
        ]);
        if (!cancelled) {
          setDemo(demoData);
          setOpportunities(oppData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { demo, opportunities, loading, error };
}
