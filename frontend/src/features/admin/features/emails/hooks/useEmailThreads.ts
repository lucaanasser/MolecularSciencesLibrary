/**
 * Hook de listagem de threads da caixa de contato@ (uma pasta por vez, paginado).
 * Usado em: EmailsInbox. Depende de: EmailsService.listThreads.
 */
import { useCallback, useEffect, useState } from "react";
import { logger } from "@/utils/logger";
import { EmailsService } from "@/services/EmailsService";
import type { EmailFolder, EmailThreadsResponse } from "../types/email";

export function useEmailThreads(folder: EmailFolder, page: number) {
  const [data, setData] = useState<EmailThreadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await EmailsService.listThreads(folder, page));
    } catch (err) {
      logger.error("🔴 [useEmailThreads] Erro ao listar threads", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar emails");
    } finally {
      setLoading(false);
    }
  }, [folder, page]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return { data, loading, error, refetch: fetchThreads };
}
