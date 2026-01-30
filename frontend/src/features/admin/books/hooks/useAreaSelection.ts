import { useState } from "react";
import useBookOptions from "@/hooks/useBookOptions";

/**
 * Hook para seleção de área e subárea de livros.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
export default function useAreaSelection(onError?: (e: Error) => void) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const { areaCodes, subareaCodes } = useBookOptions(onError);

  // Log de início de operação
  console.log("🔵 [useAreaSelection] Inicializando seleção de área/subárea");

  return { category, setCategory, subcategory, setSubcategory, areaCodes, subareaCodes };
}