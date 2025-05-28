import { useState, useEffect } from "react";
import { AreaCode, SubareaCode } from "../types/book";

const API_URL = '/api';

/**
 * Hook para buscar opções de área e subárea de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function useBookOptions(onError?: (error: Error) => void) {
  const [areaCodes, setAreaCodes] = useState<AreaCode>({});
  const [subareaCodes, setSubareaCodes] = useState<SubareaCode>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    console.log("🔵 [useBookOptions] Buscando opções de área e subárea");
    fetch(`${API_URL}/books/options`)
      .then(res => res.json())
      .then(data => {
        setAreaCodes(data.areaCodes || {});
        setSubareaCodes(data.subareaCodes || {});
        setIsLoading(false);
        console.log("🟢 [useBookOptions] Opções carregadas");
      })
      .catch(error => {
        console.error("🔴 [useBookOptions] Erro ao buscar opções:", error);
        if (onError) onError(new Error("Falha ao carregar opções. Tente novamente."));
        setIsLoading(false);
      });
  }, [onError]);

  return { areaCodes, subareaCodes, isLoading };
}