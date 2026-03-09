import { useState, useCallback, useEffect } from "react";
import { logger } from "@/utils/logger";
import { getFullDiscipline, type FullDiscipline } from "@/services/DisciplinesService";

export function useDisciplinePage(codigo: string | undefined) {
  const [disciplina, setDisciplina] = useState<FullDiscipline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiscipline = useCallback(async () => {
    if (!codigo) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFullDiscipline(codigo);
      if (!data) {
        setError("Disciplina não encontrada");
        return;
      }
      setDisciplina(data);
    } catch (err) {
      logger.error("Erro ao carregar disciplina:", err);
      setError("Erro ao carregar disciplina");
    } finally {
      setIsLoading(false);
    }
  }, [codigo]);

  useEffect(() => {
    loadDiscipline();
  }, [loadDiscipline]);

  return { disciplina, isLoading, error, reload: loadDiscipline };
}
