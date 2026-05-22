import { useState, useEffect } from "react";
import { api } from "../utils/api";

export function useSignalEngine() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [demoData, statsData] = await Promise.all([
          api.scanDemo(),
          api.getStats(),
        ]);
        if (!cancelled) {
          setData(demoData);
          setStats(statsData);
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

  return { data, stats, loading, error };
}
