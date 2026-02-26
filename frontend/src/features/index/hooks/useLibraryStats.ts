import { useState, useEffect } from "react";
import { ReportsService } from "@/services/ReportsService";
import { logger } from "@/utils/logger";

export default function useLibraryStats() {
  const [stats, setStats] = useState({ users: null, books: null, subareas: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    ReportsService.getBooksStatistics()
      .then((booksStats) => {
        setStats({
          users: null, // será preenchido abaixo
          books: booksStats.summary.total,
          subareas: booksStats.summary.numberOfSubareas,
        });
        return ReportsService.getUsersStatistics();
      })
      .then((usersStats) => {
        setStats((prev) => ({
          ...prev,
          users: usersStats.summary.total,
        }));
      })
      .catch((err) => {
        logger.error("🔴 [useLibraryStats] Erro ao carregar estatísticas", err);
        setError("Erro ao carregar estatísticas");
      })
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}